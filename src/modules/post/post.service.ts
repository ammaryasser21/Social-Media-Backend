import
notificationService,
{ NotificationServiceType }
    from './../../common/services/notification.service';
import { redisService, RedisServiceType } from './../../common/services/redis.service';
import {
    BadRequestResponse,
    NotFoundResponse,
} from "../../common/response";

import s3Service from "../../common/services/s3.service";

import { PostRepositry } from "../../db/repo/post.repositry";
import { UserHydrated } from "../../db/models/user.model";

import {
    ICreatePost
} from "./post.dto";

import { IPost } from "../../common/interfaces/post.interface";
import { UserRepositry } from "../../db/repo/user.repositry";
import { PaginationQuery } from '../../common/utils/general-validate-schema';
import { AvailableEnum } from '../../common/enums/available';


class PostService {

    private postRepo: PostRepositry;
    private userRepo: UserRepositry;
    private redisService: RedisServiceType;
    private notificationService: NotificationServiceType;

    constructor() {
        this.postRepo = new PostRepositry();
        this.userRepo = new UserRepositry();
        this.redisService = redisService;
        this.notificationService = notificationService;
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
        const tags = data.tags || [];


        let attachments: string[] = [];
        let FCM_Tokens_mentions: string[] = [];

        if (tags?.length) {

            const users = await this.userRepo.find({
                filter: {
                    _id: {
                        $in: tags,
                    },
                },
                projection: {
                    select: "_id",

                }
            });

            if (!users.length) throw new NotFoundResponse("Users not founded");

            // let mentions = [];

            // for (const tag of data.tags) {
            //     mentions.push(tag);

            //     const tokens = await this.redisService.getFCMToken(String(tag));
            //     tokens.forEach((e) => {
            //         FCM_Tokens_mentions.push(e);
            //     })

            // }

            const tokenResults = await Promise.all(
                tags.map(tag => this.redisService.getFCMToken(String(tag)))
            );

            FCM_Tokens_mentions.push(
                ...tokenResults.flat()
            );
        }

        if (files.length) {
            attachments = await s3Service.uploadFiles({
                files,
                folder: "posts",
                path: String(user._id),
            });

        }

        const postData: IPost = {
            content: data?.content || "",
            tags: tags,
            available: data?.available,
            attachments,
            createdBy: user._id,
        };

        const post = await this.postRepo.create({
            data: postData,
        });

        if (!post && attachments.length) {

            await s3Service.deleteFiles({
                files: attachments,
            });
            throw new BadRequestResponse("Post not created");

        }


        if (FCM_Tokens_mentions.length) {
            await Promise.allSettled(
                FCM_Tokens_mentions.map((token) =>
                    this.notificationService.sendNotification({
                        token,
                        title: `Post Created`,
                        data: `${user.first_name} mentioned for you on his post`
                    })
                )
            );

        }

        return post;
    }


    // ======================================================
    // FIND POST
    // ======================================================

    async findPost(
        filter: PaginationQuery,
        user: UserHydrated,
    ) {

        const { page, limit, search } = filter;
        // const post = await this.postRepo.findOne({

        //     filter: {
        //         _id: data,
        //         deletedAt: {
        //             $exists: false,
        //         },
        //     },

        //     options: {
        //         lean: false,
        //     },

        // });

        const posts = await this.postRepo.paginate({
            filter: {
                $or: [
                    {
                        available: AvailableEnum.PUBLIC
                    },
                    {
                        available: AvailableEnum.PRIVATE,
                        createdBy: user._id
                    },
                    {
                        available: AvailableEnum.FRIENDS,
                        createdBy: {
                            $in: [user._id, ...(user.friends || [])]
                        }
                    },
                    {
                        tags:{
                            $in:[user._id]
                        }
                    }
                ],

                ...(search && {
                    content: {
                        $regex: search,
                        $options: "i",
                    },
                }),
            },
            limit: limit ?? 10,
            page: page ?? 1,
        });


        if (!posts) {
            throw new NotFoundResponse(
                "Post not found"
            );
        }


        return posts;
    }

}


const postService = new PostService();

export default postService;
