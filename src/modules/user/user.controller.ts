import { NextFunction, Request, Response, Router } from "express";
import StatusCodes from "../../common/enums/status";
import userService from "./user.service";
import { successResponse, UnauthorizedResponse } from "../../common/response";
import { decrypt } from "../../common/utils/security/encrypt";
import { UserHydrated } from "../../db/models/user.model";


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

        const result = await userService.updateUserImg(req.file, req.user as UserHydrated);

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
        const result = await userService.updateUserCover(
            req.files as Express.Multer.File[] | undefined,
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
