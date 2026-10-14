import notificationService, { NotificationServiceType } from '../../common/services/notification.service';
import { redisService, RedisServiceType } from '../../common/services/redis.service';
import {
    BadRequestResponse,
    NotFoundResponse,
} from "../../common/response";

import s3Service from "../../common/services/s3.service";

import { ChatRepository } from "../../db/repo/chat.repository";
import { UserHydrated } from "../../db/models/user.model";

import {
    ICreateChat
} from "./chat.dto";

import { IChat } from "../../common/interfaces/chat.interface";
import { UserRepository } from "../../db/repo/user.repository";


class ChatService {
    private chatRepo: ChatRepository;
    private userRepo: UserRepository;
    private redisService: RedisServiceType;
    private notificationService: NotificationServiceType;

    constructor() {
        this.chatRepo = new ChatRepository();
        this.userRepo = new UserRepository();
        this.redisService = redisService;
        this.notificationService = notificationService;
    }

    // ======================================================
    // CREATE CHAT
    // ======================================================

    async create(
        data: ICreateChat,
        files: Express.Multer.File[] = [],
        user: UserHydrated
    ) {

        if (!data.content && !files.length) {
            throw new BadRequestResponse(
                "Chat must contain content or attachments"
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
                folder: "chats",
                path: String(user._id),
            });

        }

        const chatData: IChat = {
            content: data?.content || "",
            tags: tags,
            available: data?.available,
            attachments,
            createdBy: user._id,
        };

        const chat = await this.chatRepo.create({
            data: chatData,
        });

        if (!chat && attachments.length) {

            await s3Service.deleteFiles({
                files: attachments,
            });
            throw new BadRequestResponse("Chat not created");

        }


        if (FCM_Tokens_mentions.length) {
            await Promise.allSettled(
                FCM_Tokens_mentions.map((token) =>
                    this.notificationService.sendNotification({
                        token,
                        title: `Chat Created`,
                        data: `${user.first_name} mentioned for you on his chat`
                    })
                )
            );

        }

        return chat;
    }

}


const chatService = new ChatService();

export default chatService;
