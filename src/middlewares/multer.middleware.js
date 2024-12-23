import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Polyfill __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const filePath = path.resolve(__dirname,"../../public/temp");
      cb(null, filePath)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})

export const upload = multer({
  storage,
})
