import hashlib
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    import chromadb
    from sentence_transformers import SentenceTransformer
except Exception as exc:
    raise RuntimeError(
        "Missing Python dependencies for RAG. Install: pip install chromadb sentence-transformers"
    ) from exc

BASE_DIR = Path(__file__).resolve().parent
PRODUCT_PATH = BASE_DIR / "product.json"
CHROMA_PATH = BASE_DIR / "chroma_db"
META_PATH = CHROMA_PATH / "index_meta.json"
COLLECTION_NAME = "product_knowledge"
EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


def _load_products() -> List[Dict[str, Any]]:
    if not PRODUCT_PATH.exists():
        raise FileNotFoundError(f"Missing product knowledge source: {PRODUCT_PATH}")

    with PRODUCT_PATH.open("r", encoding="utf-8") as fp:
        products = json.load(fp)

    if not isinstance(products, list):
        raise ValueError("rag/product.json must contain a JSON array of products")

    return products


def _product_doc(product: Dict[str, Any]) -> str:
    specs = product.get("specs") or {}
    spec_lines = []
    for key, value in specs.items():
        spec_lines.append(f"{key}: {value}")

    parts = [
        f"id: {product.get('id')}",
        f"name: {product.get('name', '')}",
        f"category: {product.get('category', '')}",
        f"price: {product.get('price', '')}",
        f"originalPrice: {product.get('originalPrice', '')}",
        f"rating: {product.get('rating', '')}",
        f"reviews: {product.get('reviews', '')}",
        f"stock: {product.get('stock', '')}",
        f"description: {product.get('description', '')}",
    ]
    if spec_lines:
        parts.append("specs:\n" + "\n".join(spec_lines))

    return "\n".join(parts)


def _digest_products(products: List[Dict[str, Any]]) -> str:
    normalized = json.dumps(products, ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def _load_meta() -> Dict[str, Any]:
    if not META_PATH.exists():
        return {}
    with META_PATH.open("r", encoding="utf-8") as fp:
        return json.load(fp)


def _save_meta(meta: Dict[str, Any]) -> None:
    CHROMA_PATH.mkdir(parents=True, exist_ok=True)
    with META_PATH.open("w", encoding="utf-8") as fp:
        json.dump(meta, fp, indent=2)


def _get_client():
    CHROMA_PATH.mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(path=str(CHROMA_PATH))


def _get_collection(client, create: bool = True):
    if create:
        return client.get_or_create_collection(name=COLLECTION_NAME)
    return client.get_collection(name=COLLECTION_NAME)


def ensure_index(force_reindex: bool = False) -> Dict[str, Any]:
    products = _load_products()
    current_digest = _digest_products(products)
    meta = _load_meta()

    client = _get_client()

    existing_count = None
    try:
        existing = _get_collection(client, create=False)
        existing_count = existing.count()
    except Exception:
        existing = None

    should_skip = (
        not force_reindex
        and meta.get("digest") == current_digest
        and existing_count == len(products)
    )

    if should_skip:
        return {
            "status": "skipped",
            "collection": COLLECTION_NAME,
            "productCount": len(products),
            "dbPath": str(CHROMA_PATH),
            "reason": "index up to date",
        }

    # Safe reset if source has changed or force is enabled.
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    collection = _get_collection(client, create=True)
    model = SentenceTransformer(EMBED_MODEL_NAME)

    ids: List[str] = []
    documents: List[str] = []
    metadatas: List[Dict[str, Any]] = []

    for product in products:
        pid = product.get("id")
        if pid is None:
            continue

        pid_str = str(pid)
        ids.append(pid_str)
        documents.append(_product_doc(product))
        metadatas.append(
            {
                "product_id": pid_str,
                "name": str(product.get("name", "")),
                "category": str(product.get("category", "")),
                "product_json": json.dumps(product, ensure_ascii=False),
            }
        )

    embeddings = model.encode(documents, normalize_embeddings=True).tolist()

    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings,
    )

    _save_meta(
        {
            "digest": current_digest,
            "collection": COLLECTION_NAME,
            "productCount": len(ids),
            "source": str(PRODUCT_PATH),
            "dbPath": str(CHROMA_PATH),
            "embedModel": EMBED_MODEL_NAME,
        }
    )

    return {
        "status": "indexed",
        "collection": COLLECTION_NAME,
        "productCount": len(ids),
        "dbPath": str(CHROMA_PATH),
    }


def get_product_by_id(product_id: Any) -> Optional[Dict[str, Any]]:
    client = _get_client()
    collection = _get_collection(client, create=False)
    pid_str = str(product_id)
    result = collection.get(ids=[pid_str], include=["metadatas", "documents"])

    if not result.get("ids"):
        return None

    metadata = result["metadatas"][0] if result.get("metadatas") else {}
    document = result["documents"][0] if result.get("documents") else ""

    product_json = metadata.get("product_json")
    product = json.loads(product_json) if product_json else None

    return {
        "product": product,
        "metadata": {
            "product_id": metadata.get("product_id"),
            "name": metadata.get("name"),
            "category": metadata.get("category"),
        },
        "document": document,
    }


def query_related_products(query_text: str, n_results: int = 3) -> List[Dict[str, Any]]:
    client = _get_client()
    collection = _get_collection(client, create=False)

    result = collection.query(
        query_texts=[query_text],
        n_results=max(1, int(n_results)),
        include=["metadatas", "documents", "distances"],
    )

    out: List[Dict[str, Any]] = []
    ids = result.get("ids", [[]])[0]
    metadatas = result.get("metadatas", [[]])[0]
    documents = result.get("documents", [[]])[0]
    distances = result.get("distances", [[]])[0]

    for idx, pid in enumerate(ids):
        md = metadatas[idx] if idx < len(metadatas) else {}
        product_json = md.get("product_json") if md else None
        out.append(
            {
                "id": pid,
                "distance": distances[idx] if idx < len(distances) else None,
                "metadata": {
                    "product_id": md.get("product_id") if md else None,
                    "name": md.get("name") if md else None,
                    "category": md.get("category") if md else None,
                },
                "product": json.loads(product_json) if product_json else None,
                "document": documents[idx] if idx < len(documents) else "",
            }
        )

    return out
