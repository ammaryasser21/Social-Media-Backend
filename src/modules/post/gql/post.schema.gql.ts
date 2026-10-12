import { 
    postGQLResponse, 
    postsGQLResponse 
} from "./post.types";
import postResolver from "./post.resolver";
import { 
    postArgs, 
    reactPostArgs 
} from "./post.args";

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
            reactPosts:{
                type:postGQLResponse,
                args:reactPostArgs,
                resolver:this.postResolver.reactPost
            }

        }
    }
}

const postSchema = new PostSchema();
export default postSchema;