import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/tasks");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // e.g. ".png", ".pdf"
    cb(null, uniqueSuffix + "-" + file.fieldname + ext);
  },
});

const upload = multer({ storage: storage });
export default upload;
