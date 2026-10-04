import {
    BadRequestResponse,
    ErrorResponse,
    NotFoundResponse,
} from "../../common/response";

import s3Service from "../../common/services/s3.service";

import { PostRepositry } from "../../db/repo/post.repositry";
import { UserHydrated } from "../../db/models/user.model";

import {
    ICreatePost,
    IFindPost,
} from "./post.dto";

import { IPost } from "../../common/interfaces/post.interface";


class PostService {

    private postRepo: PostRepositry;

    constructor() {
        this.postRepo = new PostRepositry();
    }


    // ======================================================
    // CREATE POST
    // ======================================================

    async createPost(
        data: ICreatePost,
        files: Express.Multer.File[] = [],
        user: UserHydrated
    ) {

        if (!data.content && !files.length) {
            throw new BadRequestResponse(
                "Post must contain content or attachments"
            );
        }


        let attachments: string[] = [];

        try {

            if (files.length) {

                attachments = await s3Service.uploadFiles({
                    files,
                    folder: "posts",
                    path: String(user._id),
                });

            }
            const postData: IPost = {

                content: data?.content || "",

                tags: data?.tags || [],

                available: data?.available,

                attachments,

                createdBy: user._id,

            };


            const post = await this.postRepo.create({
                data: postData,
            });


            return post;

        } catch (error) {

            if (attachments.length) {

                await s3Service.deleteFiles({
                    files: attachments,
                });

            }

            throw error;
        }
    }


    // ======================================================
    // FIND POST
    // ======================================================

    async findPost(
        data: string,
    ) {


        const post = await this.postRepo.findOne({

            filter: {
                _id: data,
                deletedAt: {
                    $exists: false,
                },
            },

            options: {
                lean: false,
            },

        });


        if (!post) {
            throw new NotFoundResponse(
                "Post not found"
            );
        }


        return post;
    }

}


const postService = new PostService();

export default postService;
