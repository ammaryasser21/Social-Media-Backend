import { z } from "zod";

import {
    generalSchema,
    objectIdSchema,
    PaginationQuerySchema,
} from "../../common/utils/general-validate-schema";

import { AvailableEnum } from "../../common/enums/available";
import { Types } from "mongoose";


// ======================================================
// CREATE POST
// ======================================================

export const createPostSchema = {

    body: z
        .strictObject({

            content: z
                .string()
                .trim()
                .min(1, "Content cannot be empty")
                .max(5000, "Content cannot exceed 5000 characters")
                .optional(),

            tags: z
                .array(objectIdSchema)
                .max(20, "Maximum 20 tags are allowed")
                .optional()
                .transform((tags) => {

                    if (!tags?.length) {
                        return undefined;
                    }

                    return [...new Set(tags)];
                }),

            available: z
                .enum(AvailableEnum)
                .default(AvailableEnum.PUBLIC),

        })
        .superRefine((val, ctx) => {
            if (val.tags?.length) {
                const unique = [...new Set(val.tags)];
                if (unique.length !== val.tags.length) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["tags"],
                        message: "dublicated tags"
                    })
                }

                for (const tag of val.tags) {
                    if (!Types.ObjectId.isValid(tag)) {
                        ctx.addIssue({
                            code: "custom",
                            path: ["tags"],
                            message: "Tags must be object id"
                        })
                    }
                }
            }

        }),

    files: z
        .array(generalSchema.file)
        .max(
            10,
            "Maximum 10 attachments are allowed"
        )
        .optional(),
};


// ======================================================
// FIND POST
// ======================================================

export const findPostSchema = {

    params: z.strictObject({

        postId: objectIdSchema,

    }),
    query:PaginationQuerySchema

};



