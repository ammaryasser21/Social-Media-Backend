import { 
    GraphQLEnumType, 
    GraphQLInt, 
    GraphQLList, 
    GraphQLNonNull, 
    GraphQLObjectType, 
    GraphQLString 
} from "graphql";

export const userGQLResponse = new GraphQLObjectType({
    name: "userGQLResponse",
    fields: {
        name: {
            type: GraphQLString
        },
        age: {
            type: GraphQLInt
        }
    }
})

const usersAvailableEnum = new GraphQLEnumType({
    name: "userRole",
    values: {
        ADMIN: {
            value: "admin"
        },
        USER: {
            value: "user"
        },
    },
});

export const usersGQLResponse = new GraphQLList(
    new GraphQLObjectType({
        name: "UserInfo",
        fields: {
            name: { type: new GraphQLNonNull(GraphQLString) },
            age: { type: GraphQLInt },
            role: { type: usersAvailableEnum }
        }
    }),
)