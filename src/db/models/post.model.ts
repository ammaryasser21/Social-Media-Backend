import {
    Schema,
    Types,
    model,
    type HydratedDocument,
} from "mongoose";

import { AvailableEnum } from "../../common/enums/available.js";
import { IPost } from "../../common/interfaces/post.interface.js";

export type PostHydrated = HydratedDocument<IPost>;

const postSchema = new Schema<IPost>(
    {
        content: {
            type: String,
            trim: true,
            maxLength: 5000,
            required: function (): boolean {
                return this.attachments?.length == 0;
            }
        },

        tags: {
            type: [Types.ObjectId],
        },

        likes: {
            type: [Types.ObjectId],
            ref: "User",
        },

        attachments: {
            type: [String],
            default: [],
        },

        available: {
            type: String,
            enum: AvailableEnum,
            default: AvailableEnum.PUBLIC,
            required: true,
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
        collection: "posts",

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

export const Post = model<IPost>("Post", postSchema);