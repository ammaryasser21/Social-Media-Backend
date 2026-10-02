import { ObjectCannedACL } from "@aws-sdk/client-s3"
import { STORAGE_TYPES } from "../enums/multer"

export type IUploadFile = {
    file: Express.Multer.File,
    bucket?: string,
    folder: string,
    path: string,
    ACL?: ObjectCannedACL,
    ContentType?: string,
}

export type IUploadLargeFile = {
    partSize?: number
} & IUploadFile;
export type IUploadFiles ={
    files: Express.Multer.File[],
    bucket?: string,
    folder: string,
    path: string,
    ACL?: ObjectCannedACL,
    ContentType?: string,
}
export type IUploadPresignedFile = {
    fileName: string,
    bucket?: string,
    folder: string,
    path: string,
    contentType: string,
    expiresIn: number

}
export type IUploadPresignedFiles = {
    files: string[],
    bucket?: string,
    folder: string,
    path: string,
    contentType: string,
    expiresIn: number

}

export type IGetFile = {
    fileName: string,
    bucket?: string,
    download?: boolean,
    expiresIn?: number
}

export type IDeleteFile = {
    fileName: string,
    bucket?: string,
}
export type IDeleteFiles = {
    files: string[],
    bucket?: string,
}