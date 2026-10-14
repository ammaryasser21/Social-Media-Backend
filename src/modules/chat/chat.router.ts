import { Router } from "express";

import {
    createChat,
} from "./chat.controller";

import {
    MIME_TYPES,
    STORAGE_TYPES,
    UPLOAD_WAY,
} from "../../common/enums/multer";

import { validation } from "../../middleware";

import cloudUpload from "../../common/utils/cloud-multer";

import {
    createChatSchema,
} from "./chat.validation";

import { auth } from "../../middleware/auth.middlware";

const chatRouter = Router();

chatRouter.use(auth);


// ======================================================
// CREATE CHAT
// ======================================================

chatRouter.post(
    "/",
    cloudUpload({
        storageType: STORAGE_TYPES.DISK,
        folder: "chats",
        fileValidation: MIME_TYPES.IMAGE,
        upload: {
            way: UPLOAD_WAY.ARRAY,
            fieldName: "attachments",
            maxCount: 10,
        },
    }),
    validation(createChatSchema),
    createChat
);

export default chatRouter;
