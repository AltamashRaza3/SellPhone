import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = "uploads/pickups";

/* Ensure directory exists */
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const uploadPickupImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
});
