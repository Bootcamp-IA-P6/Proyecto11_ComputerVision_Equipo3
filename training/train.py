import argparse
from pathlib import Path

from ultralytics import YOLO

PROFILES = {
    "fast": {
        "model": "yolo11n.pt",
        "epochs": 15,
        "patience": 5,
        "fraction": 0.3,
        "imgsz": 416,
        "batch": 16,
        "name": "logo-detection-fast",
    },
    "medium": {
        "model": "yolo11s.pt",
        "epochs": 20,
        "patience": 5,
        "fraction": 1.0,
        "imgsz": 640,
        "batch": 16,
        "name": "logo-detection-medium",
    },
    "full": {
        "model": "yolo11s.pt",
        "epochs": 50,
        "patience": 10,
        "fraction": 1.0,
        "imgsz": 640,
        "batch": 16,
        "name": "logo-detection-full",
    },
}


def main() -> None:
    parser = argparse.ArgumentParser(description="Entrenar detector de logos con YOLO11")
    parser.add_argument(
        "--profile",
        choices=PROFILES.keys(),
        default="medium",
        help="Perfil de entrenamiento (default: medium, ~4-6 h en RTX 4080)",
    )
    args = parser.parse_args()
    config = PROFILES[args.profile]

    base_dir = Path(__file__).resolve().parent
    data_yaml = base_dir.parent / "data" / "processed" / "data.yaml"
    models_dir = base_dir.parent / "models"
    models_dir.mkdir(parents=True, exist_ok=True)

    print(f"Perfil: {args.profile}")
    print(f"Dataset: {data_yaml}")
    print(f"Pesos guardados en: {models_dir}")
    print(
        f"Config: {config['model']}, {config['epochs']} epochs, "
        f"fraction={config['fraction']}, imgsz={config['imgsz']}"
    )

    model = YOLO(config["model"])

    results = model.train(
        data=str(data_yaml),
        epochs=config["epochs"],
        imgsz=config["imgsz"],
        batch=config["batch"],
        fraction=config["fraction"],
        device=0,
        project=str(models_dir),
        name=config["name"],
        patience=config["patience"],
        save=True,
        plots=True,
        val=True,
        workers=0,
    )

    metrics = results.results_dict
    print("\nEntrenamiento completado")
    print(f"mAP@50:     {metrics.get('metrics/mAP50(B)', 0):.3f}")
    print(f"mAP@50-95:  {metrics.get('metrics/mAP50-95(B)', 0):.3f}")
    print(f"Precisión:  {metrics.get('metrics/precision(B)', 0):.3f}")
    print(f"Recall:     {metrics.get('metrics/recall(B)', 0):.3f}")


if __name__ == "__main__":
    main()
