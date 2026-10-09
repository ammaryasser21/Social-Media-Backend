import {
    GraphQLInt,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString
} from "graphql";
import userSchema from "../user/gql/user.schema.gql";

const query = new GraphQLObjectType({
    // Every Object should have name and Object of fields
    name: 'RootQueryType',
    fields: {
        //Here all Quiries
        ...userSchema.reqisterQuery,

    },
});

const mutation = new GraphQLObjectType({
    // Every Object should have name and Object of fields
    name: 'RootMutatuiomType',
    fields: {
        //Here all Quiries
        ...userSchema.registerMutation,
    },
});

var schema = new GraphQLSchema({
    // Query For getting data
    query,
    // Mustation for update and delete and create
    mutation
    // Subscription
});

export default schema;