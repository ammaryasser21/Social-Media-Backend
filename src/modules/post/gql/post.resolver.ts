import { UserHydrated } from './../../../db/models/user.model';
import { tokenTypes } from "../../../common/enums/token";
import { NotFoundResponse, UnauthorizedResponse } from "../../../common/response";
import { redisService } from "../../../common/services/redis.service";
import { tokenService } from "../../../common/services/token.service";
import { PostRepository } from "../../../db/repo/post.repository";
import { UserRepository } from "../../../db/repo/user.repository";
import postService from "../post.service";
import { TokenPayload } from '../../../common/interfaces/token.interface';

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
        args: {
            limit: number,
            page: number,
            search: string
        },
        context:{
            user:UserHydrated,
            payload:TokenPayload
        }
    ) {
        const user=context.user;

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