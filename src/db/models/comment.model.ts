import {
    Schema,
    Types,
    model,
    type HydratedDocument,
} from "mongoose";

import { IComment } from "../../common/interfaces/comment.interface";

export type PostHydrated = HydratedDocument<IComment>;

const commentSchema = new Schema<IComment>(
    {
        post_id: {
            type: Types.ObjectId,
            ref: "Post",
            required: true
        },

        reply_to:  {
            type: Types.ObjectId,
            ref: "Comment"
        },

        content: {
            type: String,
            trim: true,
            maxLength: 5000,
            required: function (): boolean {
                return !this.attachments?.length;
            }
        },

        tags: [Types.ObjectId],

        likes: {
            type: [Types.ObjectId],
            ref: "User",
        },

        attachments: {
            type: [String],
            default: [],
        },

        createdBy: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },

        deletedAt: {
            type: Date,
            default: null,
        },

        restoredAt: {
            type: Date,
            default: null,
        },
    },

    {
        timestamps: true,

        optimisticConcurrency: true,

        versionKey: "version",

        strict: true,
        strictQuery: true,

        toJSON: {
            virtuals: false,
            getters: true,
        },

        toObject: {
            virtuals: false,
            getters: true,
        },
    }
);

export const Comment = model<IComment>("Comment", commentSchema);