import os
import shutil
import json
from zipfile import ZipFile

ADDON_NAME = "Light level indacator"
BASE_DIR = os.path.dirname(__file__)
BP_DIR = os.path.join(BASE_DIR, f"{ADDON_NAME} BP")
RP_DIR = os.path.join(BASE_DIR, f"{ADDON_NAME} RP")
MANIFEST_PATH = os.path.join(BP_DIR, "manifest.json")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "build")
TEMP_FOLDER = os.path.join(OUTPUT_FOLDER, "temp")

def get_addon_version():
    with open(MANIFEST_PATH) as f:
        manifest = json.load(f)
    v = manifest['header']['version']
    return f"{v[0]}.{v[1]}{v[2]}"

def package_addon():
    version = get_addon_version()
    output_name = f"{ADDON_NAME}v{version}.mcaddon"
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    # Clean old .mcaddon files
    for f in os.listdir(OUTPUT_FOLDER):
        if f.endswith(".mcaddon"):
            os.remove(os.path.join(OUTPUT_FOLDER, f))

    # Prepare temp folder
    if os.path.exists(TEMP_FOLDER):
        shutil.rmtree(TEMP_FOLDER)
    os.makedirs(TEMP_FOLDER)

    for folder in [BP_DIR, RP_DIR]:
        if os.path.exists(folder):
            shutil.copytree(folder, os.path.join(TEMP_FOLDER, os.path.basename(folder)))
        else:
            print(f"Warning: folder {folder} does not exist!")

    # Create zip (.mcaddon)
    zip_path = os.path.join(OUTPUT_FOLDER, output_name)
    with ZipFile(zip_path, 'w') as zipf:
        for root, dirs, files in os.walk(TEMP_FOLDER):
            for file in files:
                full_path = os.path.join(root, file)
                arcname = os.path.relpath(full_path, TEMP_FOLDER)
                zipf.write(full_path, arcname)

    shutil.rmtree(TEMP_FOLDER)
    print(f"Successfully created: {zip_path}")

if __name__ == "__main__":
    package_addon()
