import { Router } from "express";

import {
    createPost,
    findPost,
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
} from "./post.validation";

import { auth } from "../../middleware/auth.middlware";


const postRouter = Router();


// ======================================================
// CREATE POST
// ======================================================

postRouter.post(

    "/",

    auth,

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
// FIND POST
// ======================================================

postRouter.get(

    "/:postId",

    auth,

    validation(findPostSchema),

    findPost

);


export default postRouter;
