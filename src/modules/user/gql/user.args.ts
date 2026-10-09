import { GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";

export const userArgs = {
    name: {
        type: new GraphQLNonNull(GraphQLString),
        // defaultValue:"UserName"
    },
    age: {
        type: new GraphQLNonNull(GraphQLInt),
        // defaultValue:"UserName"
    },
}