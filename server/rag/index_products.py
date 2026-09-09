import json
import sys

from product_rag import ensure_index


def main() -> int:
    force = "--force" in sys.argv
    result = ensure_index(force_reindex=force)
    print(json.dumps(result))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
