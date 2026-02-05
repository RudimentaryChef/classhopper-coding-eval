from fastapi import File, UploadFile,APIRouter,  Response
from app.services.cloud_services import upload_to_gcs, download_from_gcs
import urllib.parse

router = APIRouter()
BUCKET_NAME = "imagestorageclasshopper"
@router.post("/cloud/upload")
async def upload_image(file: UploadFile = File(...)):
    image_name = upload_to_gcs(file)
    return {"image_name": image_name}
@router.get("/cloud/download/{file_name}")
async def download_image(file_name: str):
    file_bytes = download_from_gcs(file_name)
    # URL encode the filename to handle non-latin-1 characters
    encoded_filename = urllib.parse.quote(file_name)
    headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"}
    return Response(
        content=file_bytes,
        media_type="application/octet-stream",
        headers=headers
    )
