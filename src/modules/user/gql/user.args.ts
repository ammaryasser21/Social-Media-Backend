import { 
    GraphQLInt, 
    GraphQLList, 
    GraphQLNonNull, 
    GraphQLObjectType, 
    GraphQLString 
} from "graphql";
import { userGQLResponse } from "./user.types";

export const userArgs = {
    name: {
        type: new GraphQLNonNull(GraphQLString),
    },
    age: {
        type: new GraphQLNonNull(GraphQLInt),
    },
}

export const usersArgs = {
    users: {
        type: new GraphQLList(userGQLResponse),
    },
};