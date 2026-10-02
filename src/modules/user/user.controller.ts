import { IUploadFiles } from './../../common/interfaces/s3.interface';
import { NextFunction, Request, Response, Router } from "express";
import StatusCodes from "../../common/enums/status";
import userService from "./user.service";
import { BadRequestResponse, successResponse, UnauthorizedResponse } from "../../common/response";
import { decrypt } from "../../common/utils/security/encrypt";
import { UserHydrated } from "../../db/models/user.model";
import { MIME_TYPES } from "../../common/enums/multer";
import { pipeline } from "node:stream/promises";
import s3Service from "../../common/services/s3.service";
import { string } from 'zod';

// ======================================================
// GET CURRENT USER
// ======================================================

export const getUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new UnauthorizedResponse("Authentication required");
        }
        return successResponse({
            res,
            status: StatusCodes.SUCCESS.OK,
            data: {
                ...req.user,
                phone: req.user.phone ? decrypt(req.user.phone) : req.user.phone
            }
        });
    } catch (error) {
        next(error)
    }

};

// ======================================================
// UPDATE PROFILE IMAGE
// ======================================================

export const updateUserImg = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {
        if (!req.user) {
            throw new UnauthorizedResponse("Authentication required");
        }

        const fileOptions = {
            file: req?.file!,
            folder: "user",
            path: "profile"
        }

        const result = await userService.updateUserImg(
            fileOptions,
            req.user as UserHydrated,
        );

        return successResponse({
            res,
            message: "User image updated successfully",
            status: StatusCodes.SUCCESS.OK,
            data: result
        });
    } catch (error) {
        next(error)
    }

};


export const updateUserImgPresigned = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const fileOptions = {
            fileName: "profile_img",
            folder: "user",
            path: "profile",
            contentType: MIME_TYPES.IMAGE[1],
            expiresIn: 2
        }

        const result = await userService.updateUserImgPresigned(
            fileOptions
        );

        return successResponse({
            res,
            message: "User image updated successfully",
            status: StatusCodes.SUCCESS.OK,
            data: {
                ...result,
                expiresIn: fileOptions.expiresIn
            }
        });
    } catch (error) {
        next(error)
    }

};


export const getFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        let { fileName, download } = req.query;
        const path = (req.params.path as string[]).join("/");
        if (!fileName) {
            fileName = path.split("/").pop();
        }

        const result = await s3Service.getFile({
            fileName: path
        });

        if (result.ContentType) {
            res.setHeader(
                "Content-Type",
                result.ContentType || "application/octet-stream"
            );
        }

        if (result.ContentLength !== undefined) {
            res.setHeader(
                "Content-Length",
                result.ContentLength.toString()
            );
        }

        if (result.ETag) {
            res.setHeader("ETag", result.ETag);
        }

        if (Boolean(download) && fileName) {
            res.setHeader(
                "content-disposition",
                `attachment;filename=${fileName}`
            )
        }

        if (!result.Body) {
            throw new Error("File body is empty");
        }

        await pipeline(
            result.Body as NodeJS.ReadableStream,
            res
        );

    } catch (error) {
        next(error);
    }
};

export const getUserCover = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        if (!req.user) {
            throw new UnauthorizedResponse("Authentication required");
        }
        let { fileName, download } = req.query;
        const path = (req.params.path as string[]).join("/");
        if (!fileName) {
            fileName = path.split("/").pop();
        }
        const user = req.user as UserHydrated;

        if (!user.cover_img?.includes(path)) {
            throw new BadRequestResponse(
                "Cover image does not belong to this user"
            );
        }

        const result = await s3Service.getFile({
            fileName: path
        });

        if (!result.Body) {
            throw new Error("File body is empty");
        }

        if (result.ContentType) {
            res.setHeader(
                "Content-Type",
                result.ContentType
            );
        }

        if (result.ContentLength !== undefined) {
            res.setHeader(
                "Content-Length",
                result.ContentLength.toString()
            );
        }

        if (result.ETag) {
            res.setHeader(
                "ETag",
                result.ETag
            );
        }

        if (Boolean(download) && fileName) {
            res.setHeader(
                "content-disposition",
                `attachment;filename=${fileName}`
            )
        }

        await pipeline(
            result.Body as NodeJS.ReadableStream,
            res
        );

    } catch (error) {
        next(error);
    }
};

export const getPresignedFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        let { download } = req.query;
        const path = (req.params.path as string[]).join("/");

        const expiresIn = 5;
        const result = await s3Service.getFile({
            fileName: path,
            download: Boolean(download),
            expiresIn
        });

        return successResponse({
            res,
            message: `This url img exoiresIn ${expiresIn} minutes`,
            status: StatusCodes.SUCCESS.OK,
            data: result
        });


    } catch (error) {
        next(error);
    }
};


// ======================================================
// UPDATE COVER IMAGE
// ======================================================

export const updateUserCover = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new UnauthorizedResponse("Authentication required");
        }

        const fileOptions = {
            files: req.files as Express.Multer.File[],
            folder: "user",
            path: "covers"
        }

        const result = await userService.updateUserCover(
            fileOptions,
            req.user as UserHydrated
        );

        return successResponse({
            res,
            message: "User cover imgs updated successfully",
            status: StatusCodes.SUCCESS.OK,
            data: result
        });
    } catch (error) {
        next(error)
    }

};
