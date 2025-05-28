const { Client } = require('minio');
const { getEnv } = require('@evershop/evershop/src/lib/util/getEnv');

const minioClient = new Client({
  endPoint: getEnv('MINIO_ENDPOINT'),
  port: parseInt(getEnv('MINIO_PORT')),
  useSSL: getEnv('MINIO_USE_SSL') === 'true',
  accessKey: getEnv('MINIO_ACCESS_KEY'),
  secretKey: getEnv('MINIO_SECRET_KEY')
});

const bucketName = getEnv('MINIO_BUCKET_NAME');
const publicUrl = getEnv('MINIO_PUBLIC_URL');

module.exports = {
  list: async (path) => {
    path = path ? `${path.replace(/\/{2,}$/, '')}/` : '';

    const objectsStream = minioClient.listObjectsV2(bucketName, path, false, '/');

    const folders = new Set();
    const files = [];

    return new Promise((resolve, reject) => {
      objectsStream.on('data', (obj) => {
        if (obj.prefix) {
          // It's a "folder"
          const folderName = obj.prefix.replace(path, '').replace(/\/$/, '');
          if (folderName) folders.add(folderName);
        } else if (obj.size > 0) {
          // It's a "file"
          const fileName = obj.name.split('/').pop();
          files.push({
            name: fileName,
            url: `${publicUrl}/${bucketName}/${obj.name}`
          });
        }
      });

      objectsStream.on('end', () => {
        resolve({
          folders: Array.from(folders),
          files
        });
      });

      objectsStream.on('error', (err) => {
        console.error('Error listing objects from MinIO:', err);
        reject(err);
      });
    });
  }
};
