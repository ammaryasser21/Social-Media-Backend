
import { z } from "zod";
import {
    createPostSchema,
    findPostSchema,
    reactPostSchema,
    updatePostSchema,
} from "./post.validation";

export type ICreatePost = z.infer<typeof createPostSchema.body>;
export type IUpdatePostBody = z.infer<typeof updatePostSchema.body>;
export type IUpdatePostParams = z.infer<typeof updatePostSchema.params>;
export type IUpdatePostFiles = z.infer<typeof updatePostSchema.files>;

export type IFindPost = z.infer<typeof findPostSchema.params>;


export type IUpdatePost = {
  body: IUpdatePostBody,
  params?:IUpdatePostParams,
  files:IUpdatePostFiles
};


export type IReactPost=z.infer<typeof reactPostSchema.params>;