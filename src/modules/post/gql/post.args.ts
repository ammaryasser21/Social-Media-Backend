import { GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";

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