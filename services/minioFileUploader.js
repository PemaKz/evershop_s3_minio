const path = require('path');
const { Client } = require('minio');
const { getEnv } = require('@evershop/evershop/src/lib/util/getEnv');

// Initialize MinIO client
const minioClient = new Client({
  endPoint: getEnv('MINIO_ENDPOINT'), // e.g. 'localhost'
  port: parseInt(getEnv('MINIO_PORT')), // e.g. 9000
  useSSL: getEnv('MINIO_USE_SSL') === 'true', // true or false
  accessKey: getEnv('MINIO_ACCESS_KEY'),
  secretKey: getEnv('MINIO_SECRET_KEY')
});
const bucketName = getEnv('MINIO_BUCKET_NAME');

module.exports = {
  upload: async (files, requestedPath) => {
    const uploadPromises = [];

    for (const file of files) {
      const fileName = requestedPath
        ? `${requestedPath}/${file.filename}`
        : file.filename;

      const uploadPromise = minioClient.putObject(bucketName, fileName, file.buffer)
        .then(() => ({
          name: file.filename,
          path: path.join(requestedPath || '', file.filename),
          size: file.size,
          url: `${getEnv('MINIO_PUBLIC_URL')}/${bucketName}/${fileName}`
        }));

      uploadPromises.push(uploadPromise);
    }

    const uploadResults = await Promise.all(uploadPromises);
    return uploadResults;
  }
};
