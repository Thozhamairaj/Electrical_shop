import json
import sys

from product_rag import ensure_index, get_product_by_id, query_related_products


def main() -> int:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "usage: python retrieve_product.py <product_id> [review_text]"}))
        return 1

    product_id = sys.argv[1]
    review_text = sys.argv[2] if len(sys.argv) > 2 else ""

    ensure_index(force_reindex=False)

    product_hit = get_product_by_id(product_id)
    if not product_hit:
        print(json.dumps({"error": "product not found", "product_id": product_id}))
        return 2

    related = query_related_products(review_text, n_results=3) if review_text else []

    print(
        json.dumps(
            {
                "product": product_hit,
                "related": related,
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
