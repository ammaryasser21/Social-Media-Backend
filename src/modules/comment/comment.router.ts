import { Router } from "express";

import {
    createComment,
    findComment,
    reactComment,
    updateComment,
} from "./comment.controller";

import {
    MIME_TYPES,
    STORAGE_TYPES,
    UPLOAD_WAY,
} from "../../common/enums/multer";

import { validation } from "../../middleware";

import cloudUpload from "../../common/utils/cloud-multer";

import {
    createCommentSchema,
    findCommentSchema,
    reactCommentSchema,
    updateCommentSchema,
} from "./comment.validation";

import { auth } from "../../middleware/auth.middlware";

const commentRouter = Router();

// ======================================================
// CREATE COMMENT
// ======================================================

commentRouter.post(
    "/",
    auth,
    cloudUpload({
        storageType: STORAGE_TYPES.DISK,
        folder: "comments",
        fileValidation: MIME_TYPES.IMAGE,
        upload: {
            way: UPLOAD_WAY.ARRAY,
            fieldName: "attachments",
            maxCount: 10,
        },
    }),
    validation(createCommentSchema),
    createComment
);
// ======================================================
// UPDATE COMMENT
// ======================================================

commentRouter.patch(
    "/:id",
    auth,
    cloudUpload({
        storageType: STORAGE_TYPES.DISK,
        folder: "comments",
        fileValidation: MIME_TYPES.IMAGE,
        upload: {
            way: UPLOAD_WAY.ARRAY,
            fieldName: "attachments",
            maxCount: 10,
        },
    }),
    validation(updateCommentSchema),
    updateComment
);


// ======================================================
// UPDATE COMMENT
// ======================================================

commentRouter.patch(
    "/:id/react",
    auth,
    validation(reactCommentSchema),
    reactComment
);


// ======================================================
// FIND COMMENT
// ======================================================

commentRouter.get(
    "/:commentId",
    auth,
    validation(findCommentSchema),
    findComment
);


export default commentRouter;
