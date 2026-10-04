
import { z } from "zod";
import {
    createPostSchema,
    findPostSchema,
} from "./post.validation";

export type ICreatePost = z.infer<typeof createPostSchema.body>;

export type IFindPost = z.infer<typeof findPostSchema.params>;
