import {
    GraphQLObjectType,
    GraphQLSchema,
} from "graphql";
import userSchema from "../user/gql/user.schema.gql";
import postSchema from "../post/gql/post.schema.gql";

const query = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        ...userSchema.reqisterQuery,
        ...postSchema.reqisterQuery
    },
});

const mutation = new GraphQLObjectType({
    name: 'RootMutatuiomType',
    fields: {
        ...userSchema.registerMutation,
        ...postSchema.registerMutation
    },
});

var schema = new GraphQLSchema({
    query,
    mutation
});

export default schema;