import { PostRepository } from "../../../db/repo/post.repository";
import { UserRepository } from "../../../db/repo/user.repository";
import postService from "../post.service";
import { GQLValidation } from '../../../middleware/validation.middlware';
import { paginationSchema } from './post.args';
import { 
    IGetPostsArgs, 
    IGetPostsContext 
} from './post.types';

class PostResolver {
    private postService;
    private postRepo;
    private userRepo;

    constructor() {
        this.postService = postService;
        this.postRepo = new PostRepository();
        this.userRepo = new UserRepository();

    }

    async getPost(
        parent: any,
        args: IGetPostsArgs,
        context: IGetPostsContext
    ) {
        const user = context.user;

        await GQLValidation(paginationSchema,args)

        const posts = await this.postRepo.paginate({
            limit: args.limit || 10,
            page: args.page || 1,
            filter: {
                user
            }
        })

        return posts;
    }

}

const postResolver = new PostResolver();
export default postResolver;