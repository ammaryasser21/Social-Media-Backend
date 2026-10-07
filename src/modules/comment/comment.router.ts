import { Router } from "express";

import {
    createComment,
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
    reactCommentSchema,
    updateCommentSchema,
} from "./comment.validation";

import { auth } from "../../middleware/auth.middlware";

const commentRouter = Router({
    mergeParams:true
});

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


export default commentRouter;
