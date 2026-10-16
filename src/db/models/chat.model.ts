import {
    Schema,
    Types,
    model,
    type HydratedDocument,
} from "mongoose";

import {
    IChat,
    IMessage,
    ChatTypeEnum,
} from "../../common/interfaces/chat.interface";

export type ChatHydrated = HydratedDocument<IChat>;

const messageSchema = new Schema<IMessage>(
    {
        content: {
            type: String,
            trim: true,
            required: true,
        },

        attachment: {
            type: [String],
            default: [],
        },

        createdBy: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },

        likes: {
            type: [
                {
                    type: Types.ObjectId,
                    ref: "User",
                },
            ],
            default: [],
        },

        tags: {
            type: [
                {
                    type: Types.ObjectId,
                    ref: "User",
                },
            ],
            default: [],
        },

        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
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

const chatSchema = new Schema<IChat>(
    {
        participants: {
            type: [Types.ObjectId],
            ref: "User",
            required: true,
            validate: {
                validator: (participants: unknown[]) =>
                    participants.length > 0,
                message: "A chat must have at least one participant",
            },
        },

        createdBy: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },

        messages: {
            type: [messageSchema],
            default: [],
        },

        type: {
            type: String,
            enum: Object.values(ChatTypeEnum),
            required: true,
        },

        group_name: {
            type: String,
            trim: true,
            required: function () {
                return this.type === ChatTypeEnum.OneVersesMany;
            },
        },

        group_image: {
            type: String,
            trim: true,
            required: function (this: IChat) {
                return this.type === ChatTypeEnum.OneVersesMany;
            },
        },

        room_id: {
            type: String,
            trim: true,
            required: function (this: IChat) {
                return this.type === ChatTypeEnum.OneVersesMany;
            },
            unique: true,
        },

        deletedAt: {
            type: Date,
        },

        restoredAt: {
            type: Date,
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

export const Chat = model<IChat>("Chat", chatSchema);