import multer from "multer";
import path from "path";
import config from "../config/config.js";

// Storage konfiqurasiyası
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Faylların hara yüklənəcəyini təyin edirik
        cb(null, config.upload.uploadDir + "/");
    },
    filename: (req, file, cb) => {
        // Fayl adını unikal edirik (timestamp + original name)
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

// File filter (yalnız icazə verilmiş fayllar)
const fileFilter = (req, file, cb) => {
    if (config.upload.allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `Yalnız bu formatlar qəbul edilir: ${config.upload.allowedFileTypes.join(", ")}`
            ),
            false
        );
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: config.upload.maxFileSize },
});

export default upload;
