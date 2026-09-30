import { Router } from "express";
import {
    getUser,
    updateUserCover,
    updateUserImg
} from "./user.controller";

import localUpload from "../../common/utils/multer";

import {
    MIME_TYPES,
    STORAGE_TYPES,
    UPLOAD_WAY
} from "../../common/enums/multer";

const userRouter = Router();

userRouter.get("/profile",
    getUser
);

userRouter.patch("/profile/image",
    localUpload({
        storageType: STORAGE_TYPES.DISK,
        folder: "uploads",
        allowedMimeTypes: MIME_TYPES.IMAGE,
        upload: {
            way: UPLOAD_WAY.SINGLE,
            fieldName: "profile_img"
        }
    }),
    updateUserImg
);

userRouter.patch("/profile/cover",
    localUpload({
        storageType: STORAGE_TYPES.DISK,
        folder: "uploads",
        allowedMimeTypes: MIME_TYPES.IMAGE,
        upload: {
            way: UPLOAD_WAY.ARRAY,
            fieldName: "cover_img",
            maxCount: 5
        }
    }),
    updateUserCover
);

export default userRouter;