import { Router } from "express";

import {
    createPost,
    findPost,
    reactPost,
    updatePost,
} from "./post.controller";

import {
    MIME_TYPES,
    STORAGE_TYPES,
    UPLOAD_WAY,
} from "../../common/enums/multer";

import { validation } from "../../middleware";

import cloudUpload from "../../common/utils/cloud-multer";

import {
    createPostSchema,
    findPostSchema,
    reactPostSchema,
    updatePostSchema,
} from "./post.validation";

import { auth } from "../../middleware/auth.middlware";
import commentRouter from "../comment/comment.router";

const postRouter = Router();

postRouter.use(auth);

// Comments branch
postRouter.use(
    "/:postId/comments", 
    commentRouter
);

// ======================================================
// CREATE POST
// ======================================================

postRouter.post(
    "/",
    cloudUpload({
        storageType: STORAGE_TYPES.DISK,
        folder: "posts",
        fileValidation: MIME_TYPES.IMAGE,
        upload: {
            way: UPLOAD_WAY.ARRAY,
            fieldName: "attachments",
            maxCount: 10,
        },
    }),
    validation(createPostSchema),
    createPost
);
// ======================================================
// UPDATE POST
// ======================================================

postRouter.patch(
    "/:id",
    cloudUpload({
        storageType: STORAGE_TYPES.DISK,
        folder: "posts",
        fileValidation: MIME_TYPES.IMAGE,
        upload: {
            way: UPLOAD_WAY.ARRAY,
            fieldName: "attachments",
            maxCount: 10,
        },
    }),
    validation(updatePostSchema),
    updatePost
);


// ======================================================
// UPDATE POST
// ======================================================

postRouter.patch(
    "/:id/react",
    validation(reactPostSchema),
    reactPost
);


// ======================================================
// FIND POST
// ======================================================

postRouter.get(
    "/:postId",
    validation(findPostSchema),
    findPost
);


export default postRouter;
