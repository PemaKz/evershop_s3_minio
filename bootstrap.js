const { addProcessor } = require('@evershop/evershop/src/lib/util/registry');
const { merge } = require('@evershop/evershop/src/lib/util/merge');
const minioFileUploader = require('./services/minioFileUploader');
const minioFileDeleter = require('./services/minioFileDeleter');
const minioFileBrowser = require('./services/minioFileBrowser');
const minioFolderCreator = require('./services/minioFolderCreator');

module.exports = () => {
  addProcessor('configuratonSchema', (schema) => {
    merge(
      schema,
      {
        properties: {
          system: {
            type: 'object',
            properties: {
              file_storage: {
                enum: ['s3']
              }
            }
          }
        }
      },
      100
    );
    return schema;
  });
  addProcessor('fileUploader', function (value) {
    const { config } = this;
    if (config === 's3') {
      return minioFileUploader;
    } else {
      return value;
    }
  });

  addProcessor('fileDeleter', function (value) {
    const { config } = this;
    if (config === 's3') {
      return minioFileDeleter;
    } else {
      return value;
    }
  });

  addProcessor('folderCreator', function (value) {
    const { config } = this;
    if (config === 's3') {
      return minioFolderCreator;
    } else {
      return value;
    }
  });

  addProcessor('fileBrowser', function (value) {
    const { config } = this;
    if (config === 's3') {
      return minioFileBrowser;
    } else {
      return value;
    }
  });
};