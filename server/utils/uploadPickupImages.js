import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

/* ================= PROJECT ROOT ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server/utils → server → project root
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

/* ================= ABSOLUTE UPLOAD DIR ================= */
const uploadDir = path.join(PROJECT_ROOT, "uploads", "pickups");

/* Ensure directory exists */
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const uploadPickupImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
