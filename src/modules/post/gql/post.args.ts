import {
    GraphQLInt,
    GraphQLString
} from "graphql";
import z from "zod";

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