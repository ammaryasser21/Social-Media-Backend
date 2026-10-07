import notificationService, { NotificationServiceType } from '../../common/services/notification.service';

import { 
    redisService, 
    RedisServiceType 
} from '../../common/services/redis.service';

import {
    BadRequestResponse,
    NotFoundResponse,
} from "../../common/response";

import s3Service from "../../common/services/s3.service";
import { UserHydrated } from "../../db/models/user.model";
import { IComment } from "../../common/interfaces/comment.interface";
import { UserRepository } from "../../db/repo/user.repository";
import { PaginationQuery } from '../../common/utils/general-validate-schema';
import { Types } from 'mongoose';
import { CommentRepository } from '../../db/repo/comment.repository';

import { 
    ICreateComment, 
    IUpdateCommentBody 
} from './comment.dto';


class CommentService {

    private commentRepo: CommentRepository;
    private userRepo: UserRepository;
    private redisService: RedisServiceType;
    private notificationService: NotificationServiceType;

    constructor() {
        this.commentRepo = new CommentRepository();
        this.userRepo = new UserRepository();
        this.redisService = redisService;
        this.notificationService = notificationService;
    }


    // ======================================================
    // CREATE COMMENT
    // ======================================================

    async create(
        data: ICreateComment,
        files: Express.Multer.File[] = [],
        user: UserHydrated
    ) {

        if (!data.content && !files.length) {
            throw new BadRequestResponse(
                "Comment must contain content or attachments"
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
                folder: "comments",
                path: String(user._id),
            });

        }

        const commentData: IComment = {
            post_id: data.post_id,
            reply_to: data.reply_to,
            content: data?.content || "",
            tags: tags,
            attachments,
            createdBy: user._id,
        };

        const comment = await this.commentRepo.create({
            data: commentData,
        });

        if (!comment && attachments.length) {

            await s3Service.deleteFiles({
                files: attachments,
            });
            throw new BadRequestResponse("Comment not created");

        }


        if (FCM_Tokens_mentions.length) {
            await Promise.allSettled(
                FCM_Tokens_mentions.map((token) =>
                    this.notificationService.sendNotification({
                        token,
                        title: `Comment Created`,
                        data: `${user.first_name} mentioned for you on his comment`
                    })
                )
            );

        }

        return comment;
    }


    // ======================================================
    // FIND COMMENT
    // ======================================================

    async find(
        filter: PaginationQuery,
        user: UserHydrated,
    ) {

        const { page, limit, search } = filter;
        const comments = await this.commentRepo.paginate({
            filter: {
                tags: {
                    $in: [user._id]
                }
                ,
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


        if (!comments) {
            throw new NotFoundResponse(
                "Comment not found"
            );
        }


        return comments;
    }



    // ======================================================
    // UPDATE COMMENT
    // ======================================================

    async update(
        commentId: string,
        body: IUpdateCommentBody,
        files: Express.Multer.File[],
        user: UserHydrated
    ) {


        const {
            tags,
            remove_tags,
            remove_attachments,
            content
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
                folder: "comments",
                path: String(user._id),
            });

        }

        const updatedComment = await this.commentRepo.findOneAndUpdate({
            filter: {
                _id: new Types.ObjectId(commentId),
                createdBy: user._id
            },
            update: [{
                $set: {
                    ...(content && { content }),
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
                            tags
                        ]
                    }

                }
            }]
        })

        if (!updatedComment) {
            if (attachments.length) {
                await s3Service.deleteFiles({
                    files: attachments,
                });
            }

            throw new BadRequestResponse("Comment not updated");
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
                        title: `Comment Updated`,
                        data: `${user.first_name} mentioned for you on his comment`
                    })
                )
            );

        }

        return updatedComment;
    }

    async react(
        commentId: string,
        user: UserHydrated
    ) {

        const comment = await this.commentRepo.findOne({
            filter: {
                _id: new Types.ObjectId(commentId),
                tags: {
                    $in: [user._id]
                }


            }
        });

        if (!comment) throw new NotFoundResponse("Comment not found");
        if (comment.likes?.includes(user._id)) {
            return await this.commentRepo.findOneAndUpdate({
                filter: {
                    _id: new Types.ObjectId(commentId)
                },
                update: {
                    $pull: {
                        likes: user._id
                    }
                }
            })
        }

        return await this.commentRepo.findOneAndUpdate({
            filter: {
                _id: new Types.ObjectId(commentId)
            },
            update: {
                $addToSet: {
                    likes: user._id
                }
            }
        })

    }

}


const commentService = new CommentService();

export default commentService;
