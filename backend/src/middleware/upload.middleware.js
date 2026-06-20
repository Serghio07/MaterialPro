const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadRoot = path.join(__dirname, "../../uploads");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.uploadFolder || "generales";
    const target = path.join(uploadRoot, folder);
    ensureDir(target);
    cb(null, target);
  },
  filename: (req, file, cb) => {
    const mimeExt = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
      "image/svg+xml": ".svg",
      "image/avif": ".avif",
      "image/heic": ".heic",
      "image/heif": ".heif",
      "image/bmp": ".bmp",
      "image/tiff": ".tiff",
      "image/x-icon": ".ico",
    };
    const ext = path.extname(file.originalname) || mimeExt[file.mimetype] || ".jpg";
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const allowedImageExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
  ".heic",
  ".heif",
  ".bmp",
  ".tif",
  ".tiff",
  ".ico",
]);

const imageFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!file.mimetype.startsWith("image/") && !allowedImageExtensions.has(ext)) {
    return cb(new Error("Solo se permiten imagenes"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const setUploadFolder = (folder) => (req, res, next) => {
  req.uploadFolder = folder;
  next();
};

const fileUrl = (req) => {
  if (!req.file) return null;
  const folder = req.uploadFolder || "generales";
  return `/uploads/${folder}/${req.file.filename}`;
};

module.exports = {
  upload,
  setUploadFolder,
  fileUrl,
};
