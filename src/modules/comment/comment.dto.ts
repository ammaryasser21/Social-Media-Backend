
import { z } from "zod";
import {
    createCommentSchema,
    reactCommentSchema,
    updateCommentSchema,
} from "./comment.validation";

export type ICreateComment = z.infer<typeof createCommentSchema.body>;
export type IUpdateCommentBody = z.infer<typeof updateCommentSchema.body>;
export type IUpdateCommentParams = z.infer<typeof updateCommentSchema.params>;
export type IUpdateCommentFiles = z.infer<typeof updateCommentSchema.files>;

export type IUpdateComment = {
  body: IUpdateCommentBody,
  params?:IUpdateCommentParams,
  files:IUpdateCommentFiles
};


export type IReactComment=z.infer<typeof reactCommentSchema.params>;