import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { IDeleteFile, IDeleteFiles, IGetFile, IUploadFile, IUploadFiles, IUploadLargeFile, IUploadPresignedFile } from "../interfaces/s3.interface";
import { randomUUID } from "crypto";
import { BadRequestResponse, ErrorResponse } from "../response";
import { MIME_TYPES, STORAGE_TYPES } from "../enums/multer";
import { createReadStream } from "fs";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import StatusCodes from "../enums/status";


class S3Service {
    private client: S3Client;
    constructor() {
        this.client = new S3Client({
            region: process.env.BUCKET_REGION as string,
            credentials: {
                accessKeyId: process.env.ACCESS_KEY as string,
                secretAccessKey: process.env.SECRET_KEY as string
            }
        });
    }

    async uploadFile({
        file,
        bucket = process.env.BUCKET_NAME as string,
        folder = "general",
        path,
        ACL = 'private',
        ContentType
    }: IUploadFile) {

        const fileAsBuffer = file.buffer ?
            file.buffer : createReadStream(file.path);

        const uploadOptions = {
            Bucket: bucket,
            Key: `social_media/${folder}/${path}/${randomUUID()}-${file.originalname}`,
            Body: fileAsBuffer,
            ACL,
            ContentType: file.mimetype || ContentType
        }

        const command = new PutObjectCommand(uploadOptions);
        if (!command.input.Key) throw new BadRequestResponse("Failed to upload");

        const result = await this.client.send(command);
        if (result.ETag) throw new BadRequestResponse("Failed to upload");

        return command.input.Key;
    }


    async uploadFiles({
        files,
        bucket = process.env.BUCKET_NAME as string,
        folder = "general",
        path,
        ACL = 'private',
        ContentType
    }: IUploadFiles) {

        const urls = await Promise.all([
            files.map(async (file) => {
                const uploadedFiles = await this.uploadFile({
                    file,
                    folder,
                    path,
                    bucket,
                    ACL
                })
                return uploadedFiles;
            })
        ])


        return urls;
    }

    async uploadLargeFile({
        file,
        bucket = process.env.BUCKET_NAME as string,
        folder = "general",
        path,
        ACL = 'private',
        ContentType,
        partSize = 5 * 1024 * 1024
    }: IUploadLargeFile) {

        const fileAsBuffer = file.buffer ?
            file.buffer : createReadStream(file.path);

        const uploadOptions = {
            Bucket: bucket,
            Key: `social_media/${folder}/${path}/${randomUUID()}-${file.originalname}`,
            Body: fileAsBuffer,
            ACL,
            ContentType: file.mimetype || ContentType
        }

        const parallelUploadS3 = new Upload({
            client: this.client,
            params: uploadOptions,
            queueSize: 2,
            partSize, // 5MB
        })

        parallelUploadS3.on("httpUploadProgress", (progress) => {
            console.log({ progress });
        })

        const result = await parallelUploadS3.done();
        if (!result.Location) throw new BadRequestResponse("Failed to upload");

        return result.Key;
    }


    async uploadPresignedFile({
        fileName,
        folder = "general",
        path,
        bucket = process.env.BUCKET_NAME as string,
        contentType = MIME_TYPES.IMAGE[1],
        expiresIn = 2
    }: IUploadPresignedFile) {
        const uploadOptions = {
            Bucket: bucket,
            Key: `social_media/${folder}/${path}/${randomUUID()}-${fileName}`,
            contentType: contentType
        }

        const command = new PutObjectCommand(uploadOptions);
        if (!command.input.Key) throw new BadRequestResponse("Failed to upload");

        const url = await getSignedUrl(
            this.client,
            command,
            {
                expiresIn: expiresIn * 60
            }
        )

        return {
            url,
            key: command.input.Key
        };

    }

    async getFile({
        bucket = process.env.BUCKET_NAME as string,
        fileName,

    }: IGetFile) {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: fileName
        })
        if (!command.input.Key) throw new BadRequestResponse("File not existed");

        const result = await this.client.send(command);
        if (!result) throw new BadRequestResponse("File not existed");

        return result;


    }

    async getPresignedFile({
        bucket = process.env.BUCKET_NAME as string,
        fileName,
        download = false,
        expiresIn = 5
    }: IGetFile) {

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: fileName,
            ResponseContentDisposition: download ?
                `attachment;filename=${fileName}` : undefined
        })
        if (!command.input.Key) throw new BadRequestResponse("File not existed");

        const url = await getSignedUrl(
            this.client,
            command,
            {
                expiresIn: expiresIn * 60,

            }

        )

        return url;
    }

    async deleteFile({
        bucket = process.env.BUCKET_NAME as string,
        fileName,

    }: IDeleteFile) {
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: fileName
        })
        if (!command.input.Key) throw new ErrorResponse(
            "File not deleted",
            StatusCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR
        );

        const result = await this.client.send(command);
        if (!result) throw new ErrorResponse(
            "File not deleted",
            StatusCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR
        );

        return result;
    }


    async deleteFiles({
        bucket = process.env.BUCKET_NAME as string,
        files,

    }: IDeleteFiles) {
        const command = new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: {
                Objects: files.map((e) => (
                    { Key: e, }
                ))
            }
        })

        const result = await this.client.send(command);
        if (!result) throw new ErrorResponse(
            "File not deleted",
            StatusCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR
        );

        return result;
    }
}

const s3Service = new S3Service();
export default s3Service;