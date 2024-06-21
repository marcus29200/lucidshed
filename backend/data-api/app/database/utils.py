from gzip import compress
from base64 import b64encode
from os.path import getsize

from app.exceptions.common import FileNotFoundException, FileTooLargeException

async def compress_and_b64encode(file_path):

    b64_encoded = ""
    size = getsize(file_path)
    if(size > 5000000):
        raise FileTooLargeException(file_path=file_path, file_size=size)
    try:
        with open(file_path, 'rb') as image:
            image_binary = image.read()
            compressed_binary = gzip.compress(image_binary)
            b64_encoded = base64.b64encode(compressed_data).decode('utf-8')
    except FileNotFoundError:
        raise FileNotFoundException(file_path=file_path)

    return b64_encoded