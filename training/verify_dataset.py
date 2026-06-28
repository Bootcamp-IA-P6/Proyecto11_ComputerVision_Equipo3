import os
import yaml

DATASET_PATH = "../data/processed"

with open(os.path.join(DATASET_PATH, "data.yaml")) as f:
    config = yaml.safe_load(f)

print(f"Clases: {config['names']}")
print(f"Número de clases: {config['nc']}")

for split in ["train", "valid", "test"]:
    img_path = os.path.join(DATASET_PATH, split, "images")
    lbl_path = os.path.join(DATASET_PATH, split, "labels")

    if not os.path.exists(img_path):
        print(f"⚠️uv add pyyaml  {split}: carpeta de imágenes no encontrada")
        continue

    imagenes = len(os.listdir(img_path))
    etiquetas = len(os.listdir(lbl_path))
    estado = "✅" if imagenes == etiquetas else "❌ no coinciden"
    print(f"{split}: {imagenes} imágenes, {etiquetas} etiquetas {estado}")