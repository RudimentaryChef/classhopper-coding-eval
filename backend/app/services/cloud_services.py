from fastapi import UploadFile, HTTPException
from google.cloud import storage
BUCKET_NAME = "imagestorageclasshopper"
import os

def upload_to_gcs(file: UploadFile):
    """
    Uploads a file to Google Cloud Storage.
    If a file with the same name exists, appends a counter to the filename (e.g. filename(1).png).
    Also adds the final filename to the database.
    Returns the final filename used.
    """
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)

    original_filename = file.filename
    filename = original_filename
    blob = bucket.blob(filename)
    count = 1

    # Check if a blob with the given name exists.
    while blob.exists():
        name, ext = os.path.splitext(original_filename)
        filename = f"{name}({count}){ext}"
        blob = bucket.blob(filename)
        count += 1

    # Upload the file using the determined filename.
    blob.upload_from_file(file.file, content_type=file.content_type)


    return filename


def download_from_gcs(file_name: str) -> bytes:
    """
    Downloads a file from Google Cloud Storage and returns its content as bytes.
    Raises an HTTPException if the file does not exist.
    """
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(file_name)

    # Check if the file exists in the bucket
    if not blob.exists(client=client):
        raise HTTPException(status_code=404, detail="File not found")

    # Download and return the file as bytes
    return blob.download_as_bytes()
