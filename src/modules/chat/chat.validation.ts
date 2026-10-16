import { z } from "zod";

import {
    generalSchema,
    objectIdSchema,
} from "../../common/utils/general-validate-schema";


// ======================================================
// CREATE CHAT
// ======================================================

export const sayHiSchema = z.strictObject({
    message:z.string
})

export const sendMessageSchema=z.strictObject({
    content:z.string,
    sendTo:objectIdSchema
})


export const sendGroupMessageSchema=z.strictObject({
    content:z.string,
    groupId:objectIdSchema
})
