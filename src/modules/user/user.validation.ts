import { z } from "zod";
import { imageFileSchema } from "../../common/utils/general-validate-schema";

export const updateUserImgSchema = {
    file: imageFileSchema,
};

export const updateUserCoverSchema = {
    files: z.array(imageFileSchema).min(1),
};