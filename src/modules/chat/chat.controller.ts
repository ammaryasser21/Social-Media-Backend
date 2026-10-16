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
import { string } from "zod";


// ======================================================
// CREATE CHAT
// ======================================================

export const getUserChat = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const page = Number(req.query.page ?? 1);
        const size = Number(req.query.size ?? 5);

        const data = { page, size };

        const result = chatService.getUserChat(
            data,
            req.params.userId as string,
            req.user as UserHydrated
        )

        return successResponse({
            res,
            status: StatusCodes.SUCCESS.OK,
            data: result
        });

    } catch (error) {
        next(error);
    }
};
export const createGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const { group_name, participants } = req.body;
        if (!group_name || !participants) throw new BadRequestResponse("Please provide the content and userId")

        const data = {
            group_name,
            participants
        }

        const result = chatService.createGroup(
            data,
            req.user as UserHydrated
        )

        return successResponse({
            res,
            status: StatusCodes.SUCCESS.OK,
            data: result
        });

    } catch (error) {
        next(error);
    }
};
export const getGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const { groupId } = req.params;
        if (!groupId) throw new BadRequestResponse("Please provide groupId");

         const page = Number(req.query.page ?? 1);
        const size = Number(req.query.size ?? 5);

        const data = { page, size };


        const result = chatService.getGroupChat(
            data,
            groupId as string
        )

        return successResponse({
            res,
            status: StatusCodes.SUCCESS.OK,
            data: result
        });

    } catch (error) {
        next(error);
    }
};
