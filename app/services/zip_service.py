import zipfile
import os

def create_zip(file_paths, zip_name):
    zip_path = f"storage/{zip_name}.zip"

    with zipfile.ZipFile(zip_path, 'w') as z:
        for file in file_paths:
            z.write(file, os.path.basename(file))

    return zip_path
