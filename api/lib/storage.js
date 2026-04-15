const { BlobServiceClient } = require("@azure/storage-blob");

function getStorageConfig() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_STORAGE_CONTAINER || "feed-images";

  if (!connectionString) {
    throw new Error("Missing AZURE_STORAGE_CONNECTION_STRING environment variable.");
  }

  return {
    connectionString,
    containerName,
  };
}

function parseImageDataUrl(dataUrl) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);

  if (!match) {
    throw new Error("Ảnh phải ở định dạng data URL hợp lệ.");
  }

  const mimeType = match[1];
  const data = match[2];
  return { mimeType, data };
}

function extensionFromMimeType(mimeType) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  return "jpg";
}

async function uploadImageFromDataUrl(dataUrl, options = {}) {
  if (typeof dataUrl !== "string" || !dataUrl.trim()) {
    throw new Error("Thiếu dữ liệu ảnh để tải lên storage.");
  }

  if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) {
    return dataUrl;
  }

  const { mimeType, data } = parseImageDataUrl(dataUrl);
  const { connectionString, containerName } = getStorageConfig();
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  await containerClient.createIfNotExists({
    access: "blob",
  });

  const buffer = Buffer.from(data, "base64");
  const ext = extensionFromMimeType(mimeType);
  const owner = (options.username || "anonymous").replace(/[^a-z0-9_-]/gi, "").toLowerCase();
  const blobName = `feed/${owner}/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
      blobCacheControl: "public, max-age=31536000",
    },
  });

  return blockBlobClient.url;
}

module.exports = {
  uploadImageFromDataUrl,
};
