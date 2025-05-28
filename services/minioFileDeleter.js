const { Client } = require('minio');
const { getEnv } = require('@evershop/evershop/src/lib/util/getEnv');

// Initialize the MinIO client
const minioClient = new Client({
  endPoint: getEnv('MINIO_ENDPOINT'), // e.g. 'localhost'
  port: parseInt(getEnv('MINIO_PORT')), // e.g. 9000
  useSSL: getEnv('MINIO_USE_SSL') === 'true', // true or false
  accessKey: getEnv('MINIO_ACCESS_KEY'),
  secretKey: getEnv('MINIO_SECRET_KEY')
});

const bucketName = getEnv('MINIO_BUCKET_NAME');

module.exports = {
  delete: async (path) => {
    try {
      // Check if object exists
      await minioClient.statObject(bucketName, path);

      // Delete the object
      await minioClient.removeObject(bucketName, path);
    } catch (err) {
      console.error('Error deleting object from MinIO:', err);
      throw err;
    }
  }
};
