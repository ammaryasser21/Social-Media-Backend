import {
    Schema,
    Types,
    model,
    type HydratedDocument,
} from "mongoose";

import { AvailableEnum } from "../../common/enums/available";
import { IChat } from "../../common/interfaces/chat.interface";

export type ChatHydrated = HydratedDocument<IChat>;

const chatSchema = new Schema<IChat>(
    {
       
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