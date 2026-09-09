import json
import math
import os
import sys
from pathlib import Path
from typing import Any, Dict, List

BASE_DIR = Path(__file__).resolve().parent
SERVER_DIR = BASE_DIR.parent
RAG_DIR = SERVER_DIR / "rag"

try:
    import joblib
except Exception:
    joblib = None


def _safe_float(value: Any, fallback: float = 0.0) -> float:
    try:
        if value is None:
            return fallback
        out = float(value)
        if math.isnan(out) or math.isinf(out):
            return fallback
        return out
    except Exception:
        return fallback


def _review_tokenize(text: str) -> List[str]:
    return [t.strip(".,!?()[]{}:;\"'\n\t").lower() for t in text.split() if t.strip()]


def _product_keywords(product: Dict[str, Any]) -> List[str]:
    keywords: List[str] = []
    name = str(product.get("name", ""))
    category = str(product.get("category", ""))
    description = str(product.get("description", ""))

    for part in [name, category, description]:
        keywords.extend([w.lower() for w in part.replace("/", " ").replace("-", " ").split() if len(w) >= 4])

    specs = product.get("specs") or {}
    for k, v in specs.items():
        keywords.extend([w.lower() for w in str(k).split() if len(w) >= 3])
        keywords.extend([w.lower() for w in str(v).replace("/", " ").replace("-", " ").split() if len(w) >= 3])

    dedup = []
    seen = set()
    for k in keywords:
        if k not in seen:
            seen.add(k)
            dedup.append(k)
    return dedup


def _build_structured_features(review_title: str, review_text: str, rating: float, product_payload: Dict[str, Any]) -> Dict[str, float]:
    text = f"{review_title} {review_text}".strip()
    tokens = _review_tokenize(text)
    token_set = set(tokens)

    product = product_payload.get("product") or {}
    specs = product.get("specs") or {}

    keywords = _product_keywords(product)
    keyword_hits = len([k for k in keywords if k in token_set])
    spec_value_hits = 0
    for value in specs.values():
        for word in str(value).lower().replace("/", " ").replace("-", " ").split():
            if len(word) >= 3 and word in token_set:
                spec_value_hits += 1

    review_len = len(tokens)
    unique_ratio = (len(token_set) / review_len) if review_len else 0.0
    digit_count = sum(ch.isdigit() for ch in text)

    features = {
        "rating": _safe_float(rating, 0.0),
        "review_text_len": float(len(review_text or "")),
        "review_word_count": float(review_len),
        "title_word_count": float(len(_review_tokenize(review_title or ""))),
        "unique_word_ratio": float(unique_ratio),
        "keyword_hit_count": float(keyword_hits),
        "spec_value_hit_count": float(spec_value_hits),
        "digit_count": float(digit_count),
        "verified_purchase_hint": 0.0,
    }
    return features


def _align_features_to_model(raw_features: Dict[str, float], columns: List[str]) -> List[float]:
    vector = []
    for col in columns:
        vector.append(_safe_float(raw_features.get(col, 0.0), 0.0))
    return vector


def _gemini_reason(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "").strip().strip('"')
    if not api_key:
        return "Generated from model signals: missing GEMINI_API_KEY for expanded explanation."

    try:
        import requests
    except Exception:
        return "Generated from model signals: install requests to enable Gemini explanation enrichment."

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-1.5-flash:generateContent"
        f"?key={api_key}"
    )
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "topP": 0.9,
            "maxOutputTokens": 120,
        },
    }

    try:
        resp = requests.post(url, json=payload, timeout=8)
        if resp.status_code >= 300:
            return f"Generated from model signals. Gemini API returned status {resp.status_code}."
        data = resp.json()
        candidates = data.get("candidates") or []
        if not candidates:
            return "Generated from model signals. Gemini returned no candidate explanation."
        parts = candidates[0].get("content", {}).get("parts", [])
        text = " ".join([p.get("text", "") for p in parts]).strip()
        return text or "Generated from model signals."
    except Exception as exc:
        return f"Generated from model signals. Gemini explanation fallback used ({exc})."


def _compute_fallback_score(features: Dict[str, float]) -> float:
    # Stable heuristic fallback when Python ML deps are unavailable.
    base = 0.5
    base += min(features.get("keyword_hit_count", 0.0) * 0.03, 0.18)
    base += min(features.get("spec_value_hit_count", 0.0) * 0.03, 0.18)
    base += 0.08 if features.get("review_word_count", 0.0) >= 18 else -0.08
    base += 0.05 if features.get("digit_count", 0.0) > 0 else 0.0
    return max(0.05, min(0.95, base))


def _trust_level(score: float) -> str:
    if score >= 0.75:
        return "High Trust"
    if score >= 0.45:
        return "Medium Trust"
    return "Low Trust"


def main() -> int:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "usage: python predict_trust.py '<json_payload>'"}))
        return 1

    payload = json.loads(sys.argv[1])
    review_title = str(payload.get("reviewTitle", ""))
    review_text = str(payload.get("reviewText", ""))
    rating = payload.get("rating", 0)
    product_payload = payload.get("productPayload") or {}

    raw_features = _build_structured_features(review_title, review_text, rating, product_payload)

    model_path = BASE_DIR / "xgb_trust_model.joblib"
    cols_path = BASE_DIR / "structured_feature_cols.joblib"
    le_path = BASE_DIR / "actual_label_encoder.joblib"

    score = None
    trust_level = None

    model_available = model_path.exists() and cols_path.exists() and le_path.exists()
    model_error = None

    if model_available:
        try:
            model = joblib.load(model_path)
            feature_cols = joblib.load(cols_path)
            _ = joblib.load(le_path)

            features = _align_features_to_model(raw_features, list(feature_cols))

            # Some models were trained by concatenating structured features
            # with a fixed-length text embedding (e.g. 768 dims). If the
            # loaded model expects more features than the structured set,
            # pad with zeros to match the expected length. If it expects
            # fewer, truncate to avoid shape mismatch errors.
            try:
                expected = None
                if hasattr(model, "get_booster"):
                    expected = int(model.get_booster().num_features())
                elif hasattr(model, "booster") and hasattr(model.booster(), "num_features"):
                    expected = int(model.booster().num_features())
                if expected is not None:
                    if len(features) < expected:
                        features = features + [0.0] * (expected - len(features))
                    elif len(features) > expected:
                        features = features[:expected]
            except Exception:
                # Fall back to the original features if anything goes wrong
                pass

            if hasattr(model, "predict_proba"):
                proba = model.predict_proba([features])
                if len(proba) and len(proba[0]) > 1:
                    score = float(max(proba[0]))
                elif len(proba) and len(proba[0]) == 1:
                    score = float(proba[0][0])
            if score is None and hasattr(model, "predict"):
                pred = model.predict([features])
                try:
                    score = float(pred[0])
                    if score > 1.0:
                        score = score / 100.0
                except Exception:
                    score = 0.5
        except Exception as exc:
            model_error = str(exc)

    if score is None:
        score = _compute_fallback_score(raw_features)

    trust_level = _trust_level(score)

    product = product_payload.get("product") or {}
    reason_prompt = (
        "Generate a concise technical trust explanation for a product review. "
        "Mention whether review text includes product-specific cues from specs/category. "
        f"Product name: {product.get('name', '')}. "
        f"Category: {product.get('category', '')}. "
        f"Specs: {json.dumps(product.get('specs', {}), ensure_ascii=False)}. "
        f"Review title: {review_title}. "
        f"Review text: {review_text}. "
        f"Derived features: {json.dumps(raw_features)}. "
        f"Trust score: {score:.4f}. Trust level: {trust_level}. "
        "Return only one short paragraph."
    )
    trust_reason = _gemini_reason(reason_prompt)

    output = {
        "trust_score": round(float(score), 4),
        "trust_level": trust_level,
        "trust_reason": trust_reason,
        "structured_features": raw_features,
        "model_used": bool(model_available and model_error is None),
        "model_error": model_error,
    }

    print(json.dumps(output, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
