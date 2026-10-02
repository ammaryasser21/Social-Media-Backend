import { DeleteObjectCommandOutput } from "@aws-sdk/client-s3";
import { MIME_TYPES, STORAGE_TYPES } from "../../common/enums/multer";
import { IDeleteFile, IGetFile, IUploadFiles, IUploadLargeFile, IUploadPresignedFile, IUploadPresignedFiles } from "../../common/interfaces/s3.interface";
import { IUser } from "../../common/interfaces/user.interface";
import { BadRequestResponse, ErrorResponse, NotFoundResponse } from "../../common/response";
import { redisService, RedisServiceType } from "../../common/services/redis.service";
import s3Service from "../../common/services/s3.service";
import { tokenService, TokenServiceType } from "../../common/services/token.service";
import { decrypt } from "../../common/utils/security/encrypt";
import { UserHydrated } from "../../db/models/user.model";
import { UserRepositry } from "../../db/repo/user.repositry";
import StatusCodes from "../../common/enums/status";

class UserService {
    private userRepo: UserRepositry;
    private redisService: RedisServiceType;
    private tokenService: TokenServiceType;
    private s3Service;

    constructor() {
        this.userRepo = new UserRepositry();
        this.redisService = redisService;
        this.tokenService = tokenService;
        this.s3Service = s3Service;
    }

    async updateUserImg(
        input: IUploadLargeFile,
        user: UserHydrated
    ): Promise<UserHydrated> {
        if (!input.file) {
            throw new BadRequestResponse("No file uploaded");
        }

        if (user.profile_image) {
            const deleted = await this.s3Service.deleteFile({
                fileName: user.profile_image
            })

            if (!deleted) throw new ErrorResponse(
                "Update user img Failed",
                StatusCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR
            )
        }
        const url = this.s3Service.uploadLargeFile({
            file: input.file,
            folder: input.folder,
            path: input.path,
        })

        const updatedUser = await this.userRepo.findOneAndUpdate({
            filter: { _id: user._id },
            update: { profile_image: url },
            options: {
                new: true,
                lean: false
            }
        });
        if (!updatedUser) throw new NotFoundResponse("User not found");

        return updatedUser;
    }

    async updateUserImgPresigned(
        input: IUploadPresignedFile,
    ): Promise<{
        url: string,
        key: string
    }> {


        const result = this.s3Service.uploadPresignedFile({
            fileName: input.fileName,
            folder: input.folder,
            path: input.path,
            contentType: input.contentType,
            expiresIn: input.expiresIn
        })

        return result;
    }

    async getPresignedFile(
        input: IGetFile
    ): Promise<string> {

        const url = this.s3Service.getPresignedFile({
            fileName: input.fileName,
            download: input.download!,
        })

        return url;
    }

    async updateUserCover(
        input: IUploadFiles,
        user: UserHydrated
    ): Promise<UserHydrated> {
        if (!input.files) {
            throw new BadRequestResponse("No files uploaded");
        }

        if (user.cover_img?.length) {
            const deleted = await this.s3Service.deleteFiles({
                files: user.cover_img
            })

            if (!deleted) throw new ErrorResponse(
                "Update user cover imgs Failed",
                StatusCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR
            )
        }

        const urls = await this.s3Service.uploadFiles({
            files: input.files,
            folder: input.folder,
            path: input.path
        })


        const updatedUser = await this.userRepo.findOneAndUpdate({
            filter: { _id: user._id },
            update: { cover_img: urls },
            options: {
                new: true,
                lean: false
            }
        });
        if (!updatedUser) throw new NotFoundResponse("User not found");

        return updatedUser;
    }

}

const userService = new UserService();
export default userService;