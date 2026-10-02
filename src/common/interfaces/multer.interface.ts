
import { Field, FileFilterCallback } from "multer";
import { STORAGE_TYPES, UPLOAD_WAY } from "../enums/multer";

export type FileNameGenerator = (
    file: Express.Multer.File
) => string;

export type FileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
) => void;


export interface CreateStorageOptions {
    storageType: STORAGE_TYPES;
    folder: string;
}


export interface LocalUploadOptions {
    storageType?: STORAGE_TYPES;
    folder?: string;
    fileValidation?:readonly  string[];
    maxFileSize?: number;
    upload?: UploadConfig;
}

export interface CloudUploadOptions {
    storageType?: STORAGE_TYPES;
    folder?: string;
    fileValidation?:readonly  string[];
    maxFileSize?: number;
    upload?: UploadConfig;
}


export interface SingleUpload {
    way: UPLOAD_WAY.SINGLE;
    fieldName: string;
}

export interface ArrayUpload {
    way: UPLOAD_WAY.ARRAY;
    fieldName: string;
    maxCount?: number;
}

export interface FieldsUpload {
    way: UPLOAD_WAY.FIELDS;
    fields: Field[];
}

export interface AnyUpload {
    way: UPLOAD_WAY.ANY;
}

export interface NoneUpload {
    way: UPLOAD_WAY.NONE;
}

export type UploadConfig =
    | SingleUpload
    | ArrayUpload
    | FieldsUpload
    | AnyUpload
    | NoneUpload;

