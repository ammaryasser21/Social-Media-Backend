import { z } from "zod";

import {
    generalSchema,
    objectIdSchema,
    PaginationQuerySchema,
} from "../../common/utils/general-validate-schema";

import { Types } from "mongoose";


// ======================================================
// CREATE COMMENT
// ======================================================

export const createCommentSchema = {

    body: z
        .strictObject({
            post_id: objectIdSchema,
            reply_to: objectIdSchema,
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
// FIND COMMENT
// ======================================================

export const findCommentSchema = {

    params: z.strictObject({

        commentId: objectIdSchema,

    }),
    query: PaginationQuerySchema

};


// ======================================================
// UPDATE COMMENT
// ======================================================

export const updateCommentSchema = {
    body: z.strictObject({

        content: z
            .string()
            .trim()
            .min(1, "Content cannot be empty")
            .max(5000, "Content cannot exceed 5000 characters")
            .optional(),

        remove_attachments: z
            .array(z.string())
            .optional(),

        remove_tags: z
            .array(objectIdSchema)
            .max(20, "Maximum 20 tags are allowed")
            .optional()
            .transform((tags) => {
                if (!tags?.length) return undefined;
                return [...new Set(tags)];
            }),


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
            if (val.remove_tags?.length) {
                const unique = [...new Set(val.remove_tags)];
                if (unique.length !== val.remove_tags.length) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["remove_tags"],
                        message: "dublicated remove_tags"
                    })
                }

                for (const tag of val.remove_tags) {
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

    params: z.strictObject({
        commentId: objectIdSchema
    })
}



export const reactCommentSchema = {
    params: z.strictObject({
        commentId: objectIdSchema
    })
}
