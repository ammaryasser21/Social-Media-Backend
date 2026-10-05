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

import postService from "./post.service";

import { UserHydrated } from "../../db/models/user.model";


// ======================================================
// CREATE POST
// ======================================================

export const createPost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) throw new UnauthorizedResponse(
            "Authentication required"
        );

        const files = (req.files as Express.Multer.File[]) ?? [];

        const post = await postService.createPost(
            req.body,
            files,
            req.user as UserHydrated
        );

        return successResponse({
            res,
            status: StatusCodes.SUCCESS.CREATED,
            message: "Post created successfully",
            data: post,
        });

    } catch (error) {
        next(error);
    }
};


// ======================================================
// FIND POST
// ======================================================

export const findPost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {
        const { postId } = req.params;
  
        if (!postId) throw new BadRequestResponse("Post id not found");
        const post = await postService.findPost(
            req.query,
            req.user as UserHydrated
        );

        return successResponse({
            res,
            status: StatusCodes.SUCCESS.OK,
            message: "Post retrieved successfully",
            data: post,
        });
    } catch (error) {
        next(error);
    }
};
