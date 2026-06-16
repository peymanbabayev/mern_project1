import multer from "multer";
import path from "path";
import config from "../config/config.js";

// Şəkilləri serverin diskində deyil, RAM-da (MemoryStorage) saxlayırıq
const storage = multer.memoryStorage();

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
