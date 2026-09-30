import { z } from "zod";
import { 
    updateUserCoverSchema,
    updateUserImgSchema
 } from "./user.validation";

export type IUserCoverSchema = z.infer<typeof updateUserCoverSchema.files>;
export type IUserImgSchema = z.infer<typeof updateUserImgSchema.file>;
