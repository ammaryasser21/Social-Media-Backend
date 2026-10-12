import {
    GraphQLID,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLString
} from "graphql";
import z from "zod";
import { objectIdSchema } from "../../../common/utils/general-validate-schema";

export const postArgs = {
    limit: {
        type: GraphQLInt
    },
    page: {
        type: GraphQLInt
    },
    search: {
        type: GraphQLString
    }
}

export const paginationSchema = z.strictObject({
    limit: z
        .coerce
        .number()
        .optional()
        .default(10),

    page: z
        .coerce
        .number()
        .optional()
        .default(1),

    search: z
        .coerce
        .string()
        .optional()
})

export const reactPostArgs = {
    postId: {
        type: new GraphQLNonNull(GraphQLID)
    }
}

export const reactPostSchema=z.strictObject({
    postId: objectIdSchema,
})