import os
import cv2
from pathlib import Path
from typing import List, Union

# Define the base storage directory relative to this file
BASE_DIR = Path(__file__).resolve().parent
CROPS_DIR = BASE_DIR / "crops"


def ensure_storage_exists() -> None:
    """
    Ensures that the crops directory exists in the file system.
    If it does not exist, it creates the directory along with any necessary parent folders.
    """
    if not CROPS_DIR.exists():
        CROPS_DIR.mkdir(parents=True, exist_ok=True)


def save_crop(frame, bounding_box: List[Union[int, float]], brand_name: str, timestamp: float) -> str:
    """
    Crops a specific region of interest from a video frame using bounding box coordinates
    and saves it to the local disk with a unique structured filename.

    Parameters:
    - frame: The full image array (NumPy matrix) from the video frame.
    - bounding_box: A list containing [xmin, ymin, xmax, ymax] coordinates.
    - brand_name: The string identifier of the detected brand catalog.
    - timestamp: The exact second or millisecond where the detection took place.

    Returns:
    - A string representing the relative path where the image file was successfully stored.
    """
    # Guarantee that the destination directory structure is ready before writing
    ensure_storage_exists()

    # Unpack the bounding box coordinates and cast them to integers for array slicing
    xmin, ymin, xmax, ymax = map(int, bounding_box)

    # Slice the NumPy matrix using y ranges first (rows) and x ranges second (columns)
    cropped_image = frame[ymin:ymax, xmin:xmax]

    # Normalize the string format of the brand name to avoid file system issues
    clean_brand_name = brand_name.lower().replace(" ", "_")

    # Generate a unique filename utilizing the brand name and the precise occurrence timestamp
    filename = f"{clean_brand_name}_{timestamp:.2f}.jpg"
    file_path = CROPS_DIR / filename

    # Write the high-confidence cropped image block to the designated disk path
    cv2.imwrite(str(file_path), cropped_image)

    # Return the relative path string to be securely committed to the relational database field
    return f"storage/crops/{filename}"


def get_crop_path(filename: str) -> str:
    """
    Resolves and verifies the full absolute path of a stored crop image from the file system.

    Parameters:
    - filename: The unique name of the image file.

    Returns:
    - A string containing the full path if the file exists, or an empty string if not found.
    """
    target_path = CROPS_DIR / filename
    if target_path.exists():
        return str(target_path)
    return ""