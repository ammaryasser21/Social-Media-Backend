import { Router } from "express";
import {
    getFile,
    getPresignedFile,
    getUser,
    getUserCover,
    updateUserCover,
    updateUserImg,
    updateUserImgPresigned
} from "./user.controller";

import localUpload from "../../common/utils/multer";

import {
    MIME_TYPES,
    STORAGE_TYPES,
    UPLOAD_WAY
} from "../../common/enums/multer";
import { updateUserCoverSchema, updateUserImgSchema } from "./user.validation";
import { validation } from "../../middleware";
import cloudUpload from "../../common/utils/cloud-multer";

const userRouter = Router();

userRouter.get("/profile",
    getUser
);

userRouter.patch("/profile",
    cloudUpload({
        storageType: STORAGE_TYPES.DISK,
        folder: "uploads",
        fileValidation: MIME_TYPES.IMAGE,
        upload: {
            way: UPLOAD_WAY.SINGLE,
            fieldName: "profile_img"
        }
    }),
    validation(updateUserImgSchema),
    updateUserImg
);

userRouter.patch("/profile/presigned",
    updateUserImgPresigned
);

userRouter.get(
    "/uploads/profile/*path",
    getFile
);
userRouter.get(
    "/uploads/cover/*path",
    getUserCover
);

userRouter.get(
    "presigned/uploads/*path",
    getPresignedFile
);

userRouter.patch("/cover",
    cloudUpload({
        storageType: STORAGE_TYPES.DISK,
        folder: "uploads",
        fileValidation: MIME_TYPES.IMAGE,
        upload: {
            way: UPLOAD_WAY.ARRAY,
            fieldName: "cover_img",
            maxCount: 5
        }
    }),
    validation(updateUserCoverSchema),
    updateUserCover
);

export default userRouter;