from pathlib import Path
import os

env_file = Path(__file__).parent / ".env"
for line in env_file.read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    key, _, value = line.partition("=")
    os.environ.setdefault(key.strip(), value.strip())

from huggingface_hub import HfApi

TOKEN = os.getenv("HF_TOKEN")
REPO_ID = "Marco13423/logo-detection-yolo11s"

api = HfApi()

api.create_repo(
    repo_id=REPO_ID,
    repo_type="model",
    token=TOKEN,
    exist_ok=True
)

api.upload_file(
    path_or_fileobj=str(Path("../models/logo-detection-medium/weights/best.pt")),
    path_in_repo="best.pt",
    repo_id=REPO_ID,
    repo_type="model",
    token=TOKEN
)

print(f" Modelo subido en: https://huggingface.co/{REPO_ID}")