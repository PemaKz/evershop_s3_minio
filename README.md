# Minio S3 Storage Extension for EverShop

This extension allows you to store your EverShop files including product images, banners, and more on Minio S3.

---

## 🛠 Installation Guide

## Preconfiguration
Before running the npm install command, make sure your project has an .npmrc file in the root directory with the following line:

```ini
@pemakz:registry=https://npm.pkg.github.com
```

This tells npm to pull all @pemakz scoped packages from the GitHub Package Registry.

### Step 1: Install the Extension

Use `npm` to install the extension:

```bash
npm install @pemakz/evershop_s3_minio
```

---

### Step 2: Enable the Extension

Edit the `config/default.json` file in the root directory of your EverShop installation and add the extension to the `extensions` section:

```json
{
  ...
  "system": {
    ...
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
```

---

### Step 3: Add S3 Storage Connection Information

Edit the `.env` file in the root directory and add your Minio configuration:

```env
MINIO_ENDPOINT="minio.com"
MINIO_PORT="9000"
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="accessKey"
MINIO_SECRET_KEY="secretKey"
MINIO_BUCKET_NAME="evershop"
MINIO_PUBLIC_URL="minio.com"
```

---

### Step 4: Activate the Minio S3 Storage

Still in `config/default.json`, configure the file storage option:

```json
{
  ...
  "system": {
    ...
    "file_storage": "s3"
  }
}
```

---

### Step 5: Run the Build Command

Run the following command to apply the changes:

```bash
npm run build
```