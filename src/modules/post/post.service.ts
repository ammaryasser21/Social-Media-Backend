import notificationService, { NotificationServiceType } from './../../common/services/notification.service';
import { redisService, RedisServiceType } from './../../common/services/redis.service';
import {
    BadRequestResponse,
    NotFoundResponse,
} from "../../common/response";

import s3Service from "../../common/services/s3.service";

import { PostRepository } from "../../db/repo/post.repository";
import { UserHydrated } from "../../db/models/user.model";

import {
    ICreatePost,
    IUpdatePostBody
} from "./post.dto";

import { IPost } from "../../common/interfaces/post.interface";
import { UserRepository } from "../../db/repo/user.repository";
import { PaginationQuery } from '../../common/utils/general-validate-schema';
import { AvailableEnum } from '../../common/enums/available';
import { Types } from 'mongoose';


class PostService {
    private postRepo: PostRepository;
    private userRepo: UserRepository;
    private redisService: RedisServiceType;
    private notificationService: NotificationServiceType;

    constructor() {
        this.postRepo = new PostRepository();
        this.userRepo = new UserRepository();
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
                        tags: {
                            $in: [user._id]
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



    // ======================================================
    // UPDATE POST
    // ======================================================

    async updatePost(
        postId: string,
        body: IUpdatePostBody,
        files: Express.Multer.File[],
        user: UserHydrated
    ) {


        const {
            tags,
            remove_tags,
            remove_attachments,
            content,
            available
        } = body;

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

            const tokenResults = await Promise.all(
                tags.map(tag => this.redisService.getFCMToken(String(tag)))
            );

            FCM_Tokens_mentions.push(
                ...tokenResults.flat()
            );
        }

        if (files?.length) {
            attachments = await s3Service.uploadFiles({
                files,
                folder: "posts",
                path: String(user._id),
            });

        }

        const updatedPost = await this.postRepo.findOneAndUpdate({
            filter: {
                _id: new Types.ObjectId(postId),
                createdBy: user._id
            },
            update: [{
                $set: {
                    ...(content && { content }),
                    ...(available && { available }),
                    updated_by: user._id,
                    attachments: {
                        $setUnion: [
                            {
                                $setDifference: ["$attachments", remove_attachments],
                            },
                            attachments
                        ]
                    },
                    tags: {
                        $setUnion: [
                            {
                                $setDifference: ["$tags", remove_tags],
                            },
                            tags ?? []
                        ]
                    }

                }
            }]
        })

        if (!updatedPost) {
            if (attachments.length) {

                await s3Service.deleteFiles({
                    files: attachments,
                });
                throw new BadRequestResponse("Post not updated");

            }
            throw new BadRequestResponse("Post not found and updated");
        }



        if (remove_attachments?.length) {
            await s3Service.deleteFiles({
                files: remove_attachments,
            });

        }


        if (FCM_Tokens_mentions.length) {
            await Promise.allSettled(
                FCM_Tokens_mentions.map((token) =>
                    this.notificationService.sendNotification({
                        token,
                        title: `Post Updated`,
                        data: `${user.first_name} mentioned for you on his post`
                    })
                )
            );

        }

        return updatedPost;
    }

    async reactPost(
        postId: string,
        user: UserHydrated
    ) {

        const post = await this.postRepo.findOne({
            filter: {
                _id: new Types.ObjectId(postId),
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
                        tags: {
                            $in: [user._id]
                        }
                    }
                ]
            }
        });

        if (!post) throw new NotFoundResponse("Post not found");
        if (post.likes?.includes(user._id)) {
            return await this.postRepo.findOneAndUpdate({
                filter: {
                    _id: new Types.ObjectId(postId)
                },
                update: {
                    $pull: {
                        likes: user._id
                    }
                }
            })
        }

        return await this.postRepo.findOneAndUpdate({
            filter: {
                _id: new Types.ObjectId(postId)
            },
            update: {
                $addToSet: {
                    likes: user._id
                }
            }
        })

    }

}


const postService = new PostService();

export default postService;
