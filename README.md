Minio S3 storage extension for EverShop
This extension allows you to store your EverShop files including product images, banners on Minio S3.

Installation guide

Step 1: Install the extension using npm:
npm install @pemakz/evershop_s3_minio

Step 2: Enable the extension
Edit the config/default.json file in the root directory of your EverShop installation and add the following line to the extensions section:

{
  ...,
  "system": {
    ...,
    "extensions": [
      ...,
      {
        "name": "s3_file_storage",
        "resolve": "node_modules/@pemakz/evershop_s3_minio",
        "enabled": true,
        "priority": 10
      }
    ]
  }
}

Step 3: Add the S3 storage connection information to the environment variables
Edit the .env file:


MINIO_ENDPOINT="minio.com"
MINIO_PORT="9000"
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="accessKey"
MINIO_SECRET_KEY="secretKey"
MINIO_BUCKET_NAME="evershop"
MINIO_PUBLIC_URL="minio.com"

Step 4: Active the Minio S3 storage
Edit the config/default.json file in the root directory of your EverShop installation and add the following line to the file_storage section:

{
  ...,
  "system": {
    ...,
    "file_storage": "s3"
  }
}

Step 5: Run the build command
npm run build