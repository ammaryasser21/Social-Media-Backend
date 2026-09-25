import multer from "multer";
import fs from "fs";
import path from "path";
import { STORAGE_TYPES, UPLOAD_WAY } from "../enums/multer.js";


const ensureDirectory = (folder) => {
    const uploadPath = path.join(process.cwd(), "uploads", folder);

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    return uploadPath;
};

const defaultFileName = (file) => {
    return `${file.fieldname}-${Date.now()}-${file.originalname}`;
};

const createStorage = ({
    storageType,
    folder,
    fileNameGenerator,
    preserveOriginalName,
}) => {
    if (storageType === STORAGE_TYPES.MEMORY) {
        return multer.memoryStorage();
    }

    return multer.diskStorage({
        destination(req, file, cb) {
            cb(null, ensureDirectory(folder));
        },

        filename(req, file, cb) {
            const fileName = fileNameGenerator(file);

            file.finalPath = path.posix.join(
                "/uploads",
                folder,
                fileName
            );

            cb(null, fileName);
        },
    });
};

const localUpload = ({
    storageType = STORAGE_TYPES.DISK,
    folder = "general",
    allowedMimeTypes = [],
    maxFileSize = 5 * 1024 * 1024,
    fileNameGenerator = defaultFileName,
    fileFilter,

    upload = {
        way: UPLOAD_WAY.SINGLE,
        fieldName: "file",
    },
} = {}) => {
    const storage = createStorage({
        storageType,
        folder,
        fileNameGenerator,
    });

    const defaultFilter = (req, file, cb) => {
        if (
            allowedMimeTypes.length &&
            !allowedMimeTypes.includes(file.mimetype)
        ) {
            return cb(
                new Error(
                    `Invalid file type. Allowed: ${allowedMimeTypes.join(", ")}`
                ),
                false
            );
        }

        cb(null, true);
    };

    const uploader = multer({
        storage,
        limits: {
            fileSize: maxFileSize,
        },
        fileFilter: fileFilter || defaultFilter,
    });

    switch (upload.way) {
        case UPLOAD_WAY.SINGLE:
            if (!upload.fieldName) {
                throw new Error("upload.fieldName is required for SINGLE upload.");
            }

            return uploader.single(upload.fieldName);

        case UPLOAD_WAY.ARRAY:
            if (!upload.fieldName) {
                throw new Error("upload.fieldName is required for ARRAY upload.");
            }

            return uploader.array(
                upload.fieldName,
                upload.maxCount
            );

        case UPLOAD_WAY.FIELDS:
            if (!Array.isArray(upload.fields)) {
                throw new Error("upload.fields is required for FIELDS upload.");
            }

            return uploader.fields(upload.fields);

        case UPLOAD_WAY.ANY:
            return uploader.any();

        case UPLOAD_WAY.NONE:
            return uploader.none();

        default:
            throw new Error(`Unsupported upload way: ${upload.way}`);
    }
};

export default localUpload;