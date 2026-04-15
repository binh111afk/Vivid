const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} = require("@azure/storage-blob");

function getStorageConfig() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_STORAGE_CONTAINER || "feed-images";

  if (!connectionString) {
    throw new Error("Missing AZURE_STORAGE_CONNECTION_STRING environment variable.");
  }

  const accountName = extractConnectionStringValue(connectionString, "AccountName");
  const accountKey = extractConnectionStringValue(connectionString, "AccountKey");

  if (!accountName || !accountKey) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING thiếu AccountName hoặc AccountKey.");
  }

  return {
    connectionString,
    containerName,
    accountName,
    accountKey,
  };
}

function extractConnectionStringValue(connectionString, key) {
  const segments = connectionString.split(";");
  const prefix = `${key}=`;
  const matched = segments.find((item) => item.startsWith(prefix));
  return matched ? matched.slice(prefix.length) : "";
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

function buildReadSasToken({ containerName, blobName, accountName, accountKey }) {
  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  const startsOn = new Date(Date.now() - 5 * 60 * 1000);
  const expiresOn = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000);

  return generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn,
      expiresOn,
      protocol: "https",
    },
    credential,
  ).toString();
}

function withSasUrl(blobUrl, sasToken) {
  return `${blobUrl}?${sasToken}`;
}

function buildSignedBlobUrl(containerClient, blobName, config) {
  const blobClient = containerClient.getBlockBlobClient(blobName);
  const sasToken = buildReadSasToken({
    containerName: config.containerName,
    blobName,
    accountName: config.accountName,
    accountKey: config.accountKey,
  });

  return withSasUrl(blobClient.url, sasToken);
}

function buildSignedBlobUrlFromRawUrl(rawUrl, config) {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    return rawUrl;
  }

  if (rawUrl.includes("?")) {
    return rawUrl;
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return rawUrl;
  }

  if (!parsed.hostname.includes(`${config.accountName}.blob.`)) {
    return rawUrl;
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  const [containerName, ...blobParts] = segments;

  if (!containerName || !blobParts.length || containerName !== config.containerName) {
    return rawUrl;
  }

  const blobName = blobParts.join("/");
  const sasToken = buildReadSasToken({
    containerName,
    blobName,
    accountName: config.accountName,
    accountKey: config.accountKey,
  });

  return withSasUrl(rawUrl, sasToken);
}

async function uploadImageFromDataUrl(dataUrl, options = {}) {
  if (typeof dataUrl !== "string" || !dataUrl.trim()) {
    throw new Error("Thiếu dữ liệu ảnh để tải lên storage.");
  }

  if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) {
    return dataUrl;
  }

  const { mimeType, data } = parseImageDataUrl(dataUrl);
  const config = getStorageConfig();
  const blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionString);
  const containerClient = blobServiceClient.getContainerClient(config.containerName);

  await containerClient.createIfNotExists();

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

  return buildSignedBlobUrl(containerClient, blobName, config);
}

function ensureReadableImageUrl(url) {
  try {
    const config = getStorageConfig();
    return buildSignedBlobUrlFromRawUrl(url, config);
  } catch {
    return url;
  }
}

module.exports = {
  uploadImageFromDataUrl,
  ensureReadableImageUrl,
};
