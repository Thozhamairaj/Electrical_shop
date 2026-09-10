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
    if isinstance(specs, dict):
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


def _build_structured_features(payload: Dict[str, Any]) -> Dict[str, float]:
    review_title = str(payload.get("reviewTitle", ""))
    review_text = str(payload.get("reviewText", ""))
    rating = _safe_float(payload.get("rating"), 5.0)
    helpful_vote = _safe_float(payload.get("helpfulVotes"), 0.0)
    verified_purchase = 1.0 if payload.get("verifiedPurchase", False) else 0.0

    product_payload = payload.get("productPayload") or {}
    if isinstance(product_payload, dict) and "product" in product_payload:
        product = product_payload.get("product") or {}
    elif isinstance(product_payload, dict):
        product = product_payload
    else:
        product = {}

    average_rating = _safe_float(product.get("rating"), rating)
    rating_number = _safe_float(product.get("reviews"), 1.0)

    user_review_count = max(1.0, _safe_float(payload.get("userReviewsCount"), 1.0))
    user_verified_count = _safe_float(payload.get("userVerifiedCount"), 1.0 if verified_purchase else 0.0)
    user_verified_ratio = min(1.0, max(0.0, user_verified_count / user_review_count))
    user_avg_rating = _safe_float(payload.get("userAvgRating"), rating)
    user_avg_helpful_vote = _safe_float(payload.get("userAvgHelpfulVote"), helpful_vote)
    user_purchased_count = _safe_float(
        payload.get("userPurchasedCount")
        or payload.get("userPurchasesCount")
        or payload.get("userPurchaseCount"),
        0.0
    )

    text = f"{review_title} {review_text}".strip()
    tokens = _review_tokenize(text)
    token_set = set(tokens)

    specs = product.get("specs") or {}
    keywords = _product_keywords(product)
    keyword_hits = len([k for k in keywords if k in token_set])
    spec_value_hits = 0
    if isinstance(specs, dict):
        for value in specs.values():
            for word in str(value).lower().replace("/", " ").replace("-", " ").split():
                if len(word) >= 3 and word in token_set:
                    spec_value_hits += 1

    review_len = len(tokens)
    review_char_count = float(len(review_text))

    quality_score = min(1.0, (keyword_hits * 0.25) + (spec_value_hits * 0.2) + min(0.5, review_len / 25.0))
    rating_difference = abs(rating - average_rating)

    if user_purchased_count > 0:
        rating_consistency_score = min(1.0, max(0.0, user_review_count / user_purchased_count))
    else:
        if verified_purchase:
            rating_consistency_score = 1.0
        else:
            rating_consistency_score = min(1.0, max(0.0, user_verified_ratio))

    user_activity_score = min(1.0, user_review_count / 5.0)
    helpful_score = min(1.0, helpful_vote / 3.0)

    features = {
        "rating": rating,
        "helpful_vote": helpful_vote,
        "review_char_count": review_char_count,
        "verified_purchase": verified_purchase,
        "average_rating": average_rating,
        "rating_number": rating_number,
        "user_review_count": user_review_count,
        "user_purchased_count": user_purchased_count,
        "user_avg_rating": user_avg_rating,
        "user_avg_helpful_vote": user_avg_helpful_vote,
        "user_verified_ratio": user_verified_ratio,
        "user_activity_score": user_activity_score,
        "helpful_score": helpful_score,
        "quality_score": quality_score,
        "rating_difference": rating_difference,
        "rating_consistency_score": rating_consistency_score,
        "num_retrieved_docs": 1.0 if keyword_hits > 0 else 0.5,
        "avg_rag_similarity": min(1.0, keyword_hits * 0.25),
        "max_rag_similarity": min(1.0, keyword_hits * 0.35),
    }

    features["_keyword_hits"] = float(keyword_hits)
    features["_spec_hits"] = float(spec_value_hits)
    features["_review_word_count"] = float(review_len)
    features["_user_purchased_count"] = float(user_purchased_count)

    return features


def _align_features_to_model(raw_features: Dict[str, float], columns: List[str]) -> List[float]:
    vector = []
    for col in columns:
        vector.append(_safe_float(raw_features.get(col, 0.0), 0.0))
    return vector


def _determine_trust_level_and_score(raw_features: Dict[str, float], model_proba: List[float] = None) -> tuple:
    vp = raw_features.get("verified_purchase", 0.0)
    qs = raw_features.get("quality_score", 0.5)
    rcs = raw_features.get("rating_consistency_score", 0.8)
    uvr = raw_features.get("user_verified_ratio", 0.5)
    hs = raw_features.get("helpful_score", 0.0)
    uas = raw_features.get("user_activity_score", 0.2)

    calculated_score = (
        vp * 0.35 +
        qs * 0.25 +
        rcs * 0.20 +
        uvr * 0.10 +
        hs * 0.05 +
        uas * 0.05
    )

    if model_proba is not None and len(model_proba) > 0:
        model_prob_score = sum(idx * p for idx, p in enumerate(model_proba)) / max(1.0, float(len(model_proba) - 1))
        score = 0.5 * model_prob_score + 0.5 * calculated_score
    else:
        score = calculated_score

    score = max(0.05, min(0.98, score))

    if score >= 0.85:
        level = "Very High Trust"
    elif score >= 0.65:
        level = "High Trust"
    elif score >= 0.35:
        level = "Medium Trust"
    elif score >= 0.20:
        level = "Low Trust"
    else:
        level = "Very Low Trust"

    return level, score


def _build_trust_explanation(
    trust_level: str,
    score: float,
    raw_features: Dict[str, float],
    payload: Dict[str, Any]
) -> str:
    verified_purchase = bool(raw_features.get("verified_purchase", 0.0) > 0.5)
    helpful_votes = int(raw_features.get("helpful_vote", 0))

    keyword_hits = int(raw_features.get("_keyword_hits", 0))
    spec_hits = int(raw_features.get("_spec_hits", 0))
    word_count = int(raw_features.get("_review_word_count", 0))
    rating_diff = raw_features.get("rating_difference", 0.0)
    user_review_count = int(raw_features.get("user_review_count", 1))
    user_verified_ratio = raw_features.get("user_verified_ratio", 0.5)

    bullets = []

    # 1. Verified Purchase
    if verified_purchase:
        bullets.append("✓ Verified Purchase — The reviewer purchased this product.")
    else:
        bullets.append("✗ Verified Purchase — This review is not associated with a verified purchase.")

    # 2. Review Quality
    if (keyword_hits + spec_hits >= 5 and word_count >= 15) or word_count >= 20:
        bullets.append("✓ Review Quality — The review contains meaningful product-specific information.")
    elif word_count >= 15 or keyword_hits > 0:
        bullets.append("⚠️ Review Quality — The review contains limited product-specific information.")
    else:
        bullets.append("✗ Review Quality — The review lacks meaningful product-specific information.")

    # 3. Rating Consistency
    user_purchased_count = int(raw_features.get("_user_purchased_count", raw_features.get("user_purchased_count", 0)))
    rcs = raw_features.get("rating_consistency_score", 0.8)

    if user_purchased_count > 1:
        review_cnt = int(user_review_count)
        if rcs >= 0.75:
            bullets.append("✓ Reviewing Behaviour — The reviewer consistently provides feedback on purchased products.")
        elif rcs >= 0.4:
            bullets.append("⚠️ Reviewing Behaviour — The reviewer shows a moderate pattern of providing feedback on purchased products.")
        else:
            bullets.append("✗ Reviewing Behaviour — The reviewer shows a limited pattern of providing feedback on purchased products.")
    else:
        if rcs >= 0.75:
            bullets.append("✓ Reviewing Behaviour — The reviewer consistently provides feedback on purchased products.")
        elif rcs >= 0.4:
            bullets.append("⚠️ Reviewing Behaviour — The reviewer shows a moderate pattern of providing feedback on purchased products.")
        else:
            bullets.append("✗ Reviewing Behaviour — The reviewer shows a limited pattern of providing feedback on purchased products.")

    # 4. User Activity
    if user_review_count >= 5:
        bullets.append("✓ User Activity — The reviewer's activity pattern supports the trust prediction.")
    elif user_review_count >= 2:
        bullets.append("✓ User Activity — The reviewer shows a consistent platform activity pattern.")
    else:
        bullets.append("⚠️ User Activity — The reviewer has minimal activity history.")

    # 5. Verified User Behaviour
    if user_verified_ratio >= 0.75:
        bullets.append("✓ Verified User Behaviour — The reviewer's verified-purchase history supports the prediction.")
    elif user_verified_ratio >= 0.4:
        bullets.append("⚠️ Verified User Behaviour — A moderate proportion of the reviewer's past reviews are verified purchases.")
    else:
        bullets.append("✗ Verified User Behaviour — A low proportion of the reviewer's past reviews are verified purchases.")

    # 6. Helpful Feedback
    if helpful_votes > 0:
        bullets.append(f"✓ Helpful Feedback — This review received positive helpful feedback ({helpful_votes} vote{'s' if helpful_votes > 1 else ''}).")
    else:
        bullets.append("• Helpful Feedback — This review has not received helpful votes yet.")

    score_pct = int(round(score * 100))
    header = f"{trust_level} ,"
    score_line = f"Trust Score: {score_pct}%"

    if "Very High" in trust_level:
        title = "Why this review is considered exceptionally trustworthy:"
        overall = "Overall: These signals strongly support the reliability and authenticity of this review."
    elif "High" in trust_level:
        title = "Why this review is considered trustworthy:"
        overall = "Overall: These signals strongly support the reliability of this review."
    elif "Medium" in trust_level:
        title = "Why this review is evaluated with moderate trust:"
        overall = "Overall: These signals indicate moderate reliability for this review."
    elif "Low" in trust_level:
        title = "Why this review is flagged with low trust:"
        overall = "Overall: These signals suggest caution when evaluating the reliability of this review."
    else:
        title = "Why this review is flagged with very low trust:"
        overall = "Overall: Multiple negative or unverified signals indicate low reliability for this review."

    lines = [
        header,
        score_line,
        title,
        "",
        *bullets,
        "",
        overall
    ]

    return "\n".join(lines)


def main() -> int:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "usage: python predict_trust.py '<json_payload>'"}))
        return 1

    payload = json.loads(sys.argv[1])
    raw_features = _build_structured_features(payload)

    model_path = BASE_DIR / "xgb_trust_model.joblib"
    cols_path = BASE_DIR / "structured_feature_cols.joblib"
    le_path = BASE_DIR / "actual_label_encoder.joblib"

    score = None
    trust_level = None
    model_proba = None

    model_available = model_path.exists() and cols_path.exists() and le_path.exists()
    model_error = None

    if model_available:
        try:
            model = joblib.load(model_path)
            feature_cols = joblib.load(cols_path)
            _ = joblib.load(le_path)

            features = _align_features_to_model(raw_features, list(feature_cols))

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
                pass

            if hasattr(model, "predict_proba"):
                proba = model.predict_proba([features])
                if len(proba) and len(proba[0]) > 0:
                    model_proba = [float(p) for p in proba[0]]
        except Exception as exc:
            model_error = str(exc)

    trust_level, score = _determine_trust_level_and_score(raw_features, model_proba)
    trust_reason = _build_trust_explanation(trust_level, score, raw_features, payload)

    clean_features = {k: v for k, v in raw_features.items() if not k.startswith("_")}

    output = {
        "trust_score": round(float(score), 4),
        "trust_level": trust_level,
        "trust_reason": trust_reason,
        "structured_features": clean_features,
        "model_used": bool(model_available and model_error is None),
        "model_error": model_error,
    }

    print(json.dumps(output, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
