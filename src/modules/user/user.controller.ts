import { NextFunction, Request, Response, Router } from "express";
import StatusCodes from "../../common/enums/status";
import userService from "./user.service";
import { successResponse } from "../../common/response";


// ======================================================
// GET CURRENT USER
// ======================================================

export const getUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const user = userService.getUser(req.user);
        return successResponse({
            res,
            status: StatusCodes.SUCCESS.OK,
            data: user
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

        const result = await userService.updateUserImg(req.file, req.user);

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
        const result = await userService.updateUserCover(
            req.files as Express.Multer.File[] | undefined,
            req.user
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
