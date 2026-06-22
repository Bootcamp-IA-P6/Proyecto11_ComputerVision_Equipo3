import os
from pathlib import Path

from roboflow import Roboflow


def load_env_file() -> None:
    env_file = Path(__file__).parent / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env_file()

api_key = os.getenv("ROBOFLOW_API_KEY")
if not api_key:
    raise SystemExit(
        "Define ROBOFLOW_API_KEY in training/.env or as an environment variable "
        "(Roboflow Settings → API key, not the CLI auth token)."
    )

output_dir = Path(__file__).resolve().parent.parent / "data" / "processed"
output_dir.mkdir(parents=True, exist_ok=True)

rf = Roboflow(api_key=api_key)
project = rf.workspace("dimitar-dimitrov-qnnci").project("logo-detection-clean")
dataset = project.version(3).download("yolo26", location=str(output_dir), overwrite=True)

print(f"Dataset descargado en: {dataset.location}")

data_yaml = output_dir / "data.yaml"
if data_yaml.exists():
    print(f"Archivo de configuración: {data_yaml}")
else:
    raise SystemExit(f"La descarga terminó pero no se encontró {data_yaml}")
