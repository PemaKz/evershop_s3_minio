const { Client } = require('minio');
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

module.exports = {
  create: async (path) => {
    // Normalize path: no trailing slashes
    const requestedPath = path ? path.replace(/\/+$/, '') : '';
    if (!requestedPath) {
      throw new Error('Path is empty');
    }

    // In S3/MinIO, "folders" are simulated via zero-byte objects with trailing slashes
    const objectKey = `${requestedPath}/`; // Add trailing slash to simulate folder
    const content = Buffer.from(''); // Empty content for placeholder object

    try {
      await minioClient.putObject(bucketName, objectKey, content);
    } catch (err) {
      console.error('Failed to create folder placeholder in MinIO:', err);
      throw err;
    }
  }
};
