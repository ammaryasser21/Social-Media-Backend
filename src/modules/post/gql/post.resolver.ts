import { PostRepository } from "../../../db/repo/post.repository";
import postService from "../post.service";

class PostResolver {
    private postService;
    private postRepo;
    constructor() {
        this.postService=postService;
        this.postRepo=new PostRepository();

    }


    async getPost(
        parent: any,
        args: {
            limit:number,
            page:number,
            search:string
        },
        context: any
    ) {

        const posts=await this.postRepo.paginate(
            {
                limit:args.limit||10,
                page:args.page||1,
                filter:{

                }

            },


        )


        return posts;
    }

}

const postResolver = new PostResolver();
export default postResolver;