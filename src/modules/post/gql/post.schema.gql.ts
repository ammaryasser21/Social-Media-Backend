import { GraphQLEnumType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { postGQLResponse, postsGQLResponse } from "./post.types";
import postResolver from "./post.resolver";
import { postArgs } from "./post.args";

class PostSchema {

    private postResolver;
    constructor() {
        this.postResolver = postResolver;
    }

    reqisterQuery() {
        return {

            getPosts: {
                type: postsGQLResponse,
                args: postArgs,
                resolver: this.postResolver.getPost
            },
        }
    }

    registerMutation() {
        return {

        }
    }
}

const postSchema = new PostSchema();
export default postSchema;