import { NextFunction, Request, Response, Router } from "express";
import StatusCodes from "../../common/enums/status";
import userService from "./user.service";
import { successResponse } from "../../common/response";


export const getProfile=(req: Request, res: Response, next: NextFunction) => {
    const user= userService.getProfile(req.body);
    return successResponse({
        res,
        message:"Login Success",
        status:StatusCodes.SUCCESS.OK,
        data:user
    });
}
