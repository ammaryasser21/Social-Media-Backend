import {
    NextFunction,
    Request,
    Response,
} from "express";

import StatusCodes from "../../common/enums/status";

import {
    BadRequestResponse,
    successResponse,
    UnauthorizedResponse,
} from "../../common/response";

import chatService from "./chat.service";

import { UserHydrated } from "../../db/models/user.model";


// ======================================================
// CREATE CHAT
// ======================================================

export const createChat = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) throw new UnauthorizedResponse(
            "Authentication required"
        );

        const files = (req.files as Express.Multer.File[]) ?? [];

        const chat = await chatService.create(
            req.body,
            files,
            req.user as UserHydrated
        );

        return successResponse({
            res,
            status: StatusCodes.SUCCESS.CREATED,
            message: "Chat created successfully",
            data: chat,
        });

    } catch (error) {
        next(error);
    }
};
