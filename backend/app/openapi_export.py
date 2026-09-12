import json
import sys
from pathlib import Path

# Add backend root to sys.path if missing
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app  # noqa: E402


def export_openapi_schema(output_path: Path = Path("openapi.json")):
    """Generates and writes OpenAPI JSON schema specification file."""
    openapi_schema = app.openapi()
    output_path.write_text(json.dumps(openapi_schema, indent=2), encoding="utf-8")
    print(f"Successfully generated OpenAPI specification at '{output_path.resolve()}'")


if __name__ == "__main__":
    export_openapi_schema()
