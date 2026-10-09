import { GraphQLInt, GraphQLObjectType, GraphQLString } from "graphql";

export const userGQLResponse = new GraphQLObjectType({
    name:"userGQLResponse",
    fields:{
        name:{
            type:GraphQLString
        },
        age:{
            type:GraphQLInt
        }
    }
})