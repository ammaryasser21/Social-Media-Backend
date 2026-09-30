import multer from "multer";
import fs from "fs";
import path from "path";

import type {
    StorageEngine,
} from "multer";

import { STORAGE_TYPES, UPLOAD_WAY } from "../enums/multer";
import { CreateStorageOptions, FileFilter, LocalUploadOptions } from "../interfaces/multer.interface";
import { RequestHandler } from "express";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const ensureDirectory = (folder: string): string => {
    const uploadPath = path.join(
        process.cwd(),
        "uploads",
        folder
    );

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, {
            recursive: true,
        });
    }

    return uploadPath;
};


const defaultFileName = (
    file: Express.Multer.File
): string => {
    return `${file.fieldname}-${Date.now()}-${file.originalname}`;
};


// --------------------------------------------------
// Storage
// --------------------------------------------------

const createStorage = ({
    storageType,
    folder
}: CreateStorageOptions): StorageEngine => {

    if (storageType === STORAGE_TYPES.MEMORY) {
        return multer.memoryStorage();
    }

    return multer.diskStorage({

        destination(
            req: Express.Request,
            file: Express.Multer.File,
            cb: (error: Error | null, destination: string) => void
        ) {
            cb(null, ensureDirectory(folder));
        },

        filename(
            req: Express.Request,
            file: Express.Multer.File,
            cb: (error: Error | null, filename: string) => void
        ) {
            const fileName = defaultFileName(file);

            file.finalPath = path.posix.join(
                "/uploads",
                folder,
                fileName
            );

            cb(null, fileName);
        },
    });
};


// --------------------------------------------------
// Main Upload Function
// --------------------------------------------------

const localUpload = ({
    storageType = STORAGE_TYPES.DISK,
    folder = "general",
    allowedMimeTypes = [],
    maxFileSize = 5 * 1024 * 1024,
    upload = {
        way: UPLOAD_WAY.SINGLE,
        fieldName: "file",
    },
}: LocalUploadOptions = {}): RequestHandler => {

    const storage = createStorage({
        storageType,
        folder,
    });

    // --------------------------------------------------
    // Default File Filter
    // --------------------------------------------------

    const defaultFilter: FileFilter = (
        req,
        file,
        cb
    ) => {

        if (
            allowedMimeTypes.length > 0 &&
            !allowedMimeTypes.includes(file.mimetype)
        ) {
            return cb(new Error("Type of this file not allowed"));
        }

        cb(null, true);
    };


    // --------------------------------------------------
    // Multer Instance
    // --------------------------------------------------

    const uploader = multer({
        storage,
        limits: {
            fileSize: maxFileSize,
        },

        fileFilter: defaultFilter,
    });


    // --------------------------------------------------
    // Upload Strategy
    // --------------------------------------------------

    switch (upload.way) {

        case UPLOAD_WAY.SINGLE: {
            if (!upload.fieldName) {
                throw new Error(
                    "upload.fieldName is required for SINGLE upload."
                );
            }
            return uploader.single(upload.fieldName);
        }

        case UPLOAD_WAY.ARRAY: {
            if (!upload.fieldName) {
                throw new Error(
                    "upload.fieldName is required for ARRAY upload."
                );
            }

            if (!upload.maxCount) {
                throw new Error(
                    "upload.maxCount is required for ARRAY upload."
                );
            }
            return uploader.array(
                upload.fieldName,
                upload.maxCount
            );
        }

        case UPLOAD_WAY.FIELDS: {
            if (!Array.isArray(upload.fields)) {
                throw new Error(
                    "upload.fields is required for FIELDS upload."
                );
            }
            return uploader.fields(upload.fields);
        }

        case UPLOAD_WAY.ANY:
            return uploader.any();

        case UPLOAD_WAY.NONE:
            return uploader.none();

        default: {
            const exhaustiveCheck: never = upload;
            throw new Error(
                `Unsupported upload way: ${exhaustiveCheck}`
            );
        }
    }
};


export default localUpload;