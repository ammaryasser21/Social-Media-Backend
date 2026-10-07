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

import commentService from "./comment.service";

import { UserHydrated } from "../../db/models/user.model";
import { IUpdateCommentBody, IUpdateCommentFiles } from "./comment.dto";


// ======================================================
// CREATE COMMENT
// ======================================================

export const createComment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) throw new UnauthorizedResponse(
            "Authentication required"
        );

        const files = (req.files as Express.Multer.File[]) ?? [];
        const { postId } = req.params;
        const comment = await commentService.create(
            postId as string,
            req.body,
            files,
            req.user as UserHydrated
        );

        return successResponse({
            res,
            status: StatusCodes.SUCCESS.CREATED,
            message: "Comment created successfully",
            data: comment,
        });

    } catch (error) {
        next(error);
    }
};



// ======================================================
// UPDATE COMMENT
// ======================================================

export const updateComment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {
        const commentId = req.params.id;

        if (!commentId) throw new BadRequestResponse("Comment id not found");
        const comment = await commentService.update(
            commentId as string,
            req.body as IUpdateCommentBody,
            req.files as Express.Multer.File[],
            req.user as UserHydrated
        );

        return successResponse({
            res,
            status: StatusCodes.SUCCESS.OK,
            message: "Comment updated successfully",
            data: comment,
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// UPDATE COMMENT
// ======================================================

export const reactComment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {
        const commentId = req.params.id;

        if (!commentId) throw new BadRequestResponse("Comment id not found");
        const comment = await commentService.react(
            commentId as string,
            req.user as UserHydrated
        );

        return successResponse({
            res,
            status: StatusCodes.SUCCESS.OK,
            message: "Comment reaction updated successfully",
            data: comment,
        });
    } catch (error) {
        next(error);
    }
};