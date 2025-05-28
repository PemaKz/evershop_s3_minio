const path = require('path');
const { Client } = require('minio');
const sharp = require('sharp');
const { update } = require('@evershop/postgres-query-builder');
const { pool } = require('@evershop/evershop/src/lib/postgres/connection');
const { error } = require('@evershop/evershop/src/lib/log/logger');
const { getConfig } = require('@evershop/evershop/src/lib/util/getConfig');
const { getEnv } = require('@evershop/evershop/src/lib/util/getEnv');
// Initialize MinIO client
const minioClient = new Client({
  endPoint: getEnv('MINIO_ENDPOINT'),
  port: parseInt(getEnv('MINIO_PORT')),
  useSSL: getEnv('MINIO_USE_SSL') === 'true',
  accessKey: getEnv('MINIO_ACCESS_KEY'),
  secretKey: getEnv('MINIO_SECRET_KEY')
});

const bucketName = getEnv('MINIO_BUCKET_NAME');

/**
 * Downloads an object from MinIO and returns it as a Buffer
 */
async function downloadObjectToBuffer(objectUrl) {
  try {
    const parsedUrl = new URL(objectUrl);
    const objectKey = parsedUrl.pathname.substring(1).replace(`${bucketName}/`, '');
    console.log('Downloading object from MinIO:', objectKey);

    return new Promise((resolve, reject) => {
      const chunks = [];
      minioClient.getObject(bucketName, objectKey, (err, dataStream) => {
        if (err) return reject(err);
        dataStream.on('data', (chunk) => chunks.push(chunk));
        dataStream.on('end', () => resolve(Buffer.concat(chunks)));
        dataStream.on('error', reject);
      });
    });
  } catch (err) {
    error('Failed to download object buffer:', err);
    throw err;
  }
}


/**
 * Resizes an image and uploads it to MinIO
 */
async function resizeAndUploadImage(originalObjectUrl, resizedObjectUrl, width, height) {
  const originalImageBuffer = await downloadObjectToBuffer(originalObjectUrl);

  console.log(`Resizing image to ${width}x${height} for URL: ${resizedObjectUrl}`);

  const resizedImageBuffer = await sharp(originalImageBuffer)
    .resize({ width, height, fit: 'inside' })
    .toBuffer();

  const parsedUrl = new URL(resizedObjectUrl);
  const objectKey = parsedUrl.pathname.substring(1).replace(`${bucketName}/`, '');

  try {
    await minioClient.putObject(bucketName, objectKey, resizedImageBuffer);
    console.log(`Uploaded resized image to ${objectKey}`);
  } catch (err) {
    error('Upload failed:', err);
    throw err;
  }

  return resizedObjectUrl;
}

module.exports = async function minioGenerateProductImageVariant(data) {
  console.log('Generating product image variants for:', data);
  if (getConfig('system.file_storage') === 's3') {
    try {
      const originalObjectUrl = data.origin_image;
      console.log('Original object URL:', originalObjectUrl);
      const ext = path.extname(originalObjectUrl);
      console.log('File extension:', ext);

      const singleObjectUrl = originalObjectUrl.replace(ext, `-single${ext}`);
      const listingObjectUrl = originalObjectUrl.replace(ext, `-listing${ext}`);
      const thumbnailObjectUrl = originalObjectUrl.replace(ext, `-thumbnail${ext}`);
      
      console.log('Single image URL:', singleObjectUrl);
      console.log('Listing image URL:', listingObjectUrl);
      console.log('Thumbnail image URL:', thumbnailObjectUrl);

      const singleUrl = await resizeAndUploadImage(
        originalObjectUrl,
        singleObjectUrl,
        getConfig('catalog.product.image.single.width', 500),
        getConfig('catalog.product.image.single.height', 500)
      );

      const listingUrl = await resizeAndUploadImage(
        originalObjectUrl,
        listingObjectUrl,
        getConfig('catalog.product.image.listing.width', 250),
        getConfig('catalog.product.image.listing.height', 250)
      );

      const thumbnailUrl = await resizeAndUploadImage(
        originalObjectUrl,
        thumbnailObjectUrl,
        getConfig('catalog.product.image.thumbnail.width', 100),
        getConfig('catalog.product.image.thumbnail.height', 100)
      );

      await update('product_image')
        .given({
          single_image: singleUrl,
          listing_image: listingUrl,
          thumb_image: thumbnailUrl
        })
        .where('product_image_product_id', '=', data.product_image_product_id)
        .and('origin_image', '=', data.origin_image)
        .execute(pool);
    } catch (e) {
      error(e);
    }
  }
};
