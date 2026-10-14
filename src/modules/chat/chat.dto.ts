
import { z } from "zod";
import {
    createChatSchema,
} from "./chat.validation";

export type ICreateChat = z.infer<typeof createChatSchema.body>;
