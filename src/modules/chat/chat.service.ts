import notificationService, { NotificationServiceType } from '../../common/services/notification.service';
import { redisService, RedisServiceType } from '../../common/services/redis.service';
import {
    BadRequestResponse,
    NotFoundResponse,
} from "../../common/response";

import s3Service from "../../common/services/s3.service";

import { ChatRepository } from "../../db/repo/chat.repository";
import { UserHydrated } from "../../db/models/user.model";


import { ChatTypeEnum, IChat } from "../../common/interfaces/chat.interface";
import { UserRepository } from "../../db/repo/user.repository";
import { Types } from 'mongoose';
import { ChatHydrated } from '../../db/models/chat.model';
import { randomUUID } from 'node:crypto';


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

    getUserChat = async (
        query: {
            page: number,
            size: number
        },
        userId: string,
        user: UserHydrated
    ) => {
        const {
            page,
            size
        } = query;

        return await this.chatRepo.findOneChat({
            filter: {
                participants: {
                    $all: [
                        userId,
                        user._id.toString()
                    ],
                },

            },
            projection: {},
            options: {
                lean: false,
                populate: "participants"
            },
            page,
            size
        });
    };


    sendMessage = async (
        data: { content: string; sendTo: string },
        user: UserHydrated,
    ) => {
        const { content, sendTo } = data;
        let chat = await this.chatRepo.findOneAndUpdate({
            filter: {
                participants: {
                    $all: [sendTo, user._id],
                },
            },
            update: {
                $addToSet: {
                    messages: {
                        content: content,
                        createdBy: user._id,
                    },
                }
            },
            options: {
                new: true
            }
        })

        if (!chat) {
            chat = await this.chatRepo.create({
                data: {
                    participants: [
                        new Types.ObjectId(sendTo),
                        user._id,
                    ],
                    createdBy: user._id,
                    type: ChatTypeEnum.OneVersesOne,
                    messages: [{
                        content: content,
                        createdBy: user._id,
                    }],
                },
            });
        }

    }


    createGroup = async (
        data: {
            group_name: string;
            participants: Types.ObjectId[];
        },
        user: UserHydrated,
    ) => {
        const users = await this.userRepo.find({
            filter: {
                _id: {
                    $in: data.participants.map(e => new Types.ObjectId(e))
                },
                friends: {
                    $in: [new Types.ObjectId(user._id)],
                },

            },
        });


        if (users.length != data.participants.length) throw new BadRequestResponse("users not found");

        let roomId = randomUUID();
        const chat = await this.chatRepo.create({
            data: {
                participants: [...data.participants.map((e) => new Types.ObjectId(e)), user._id],
                group_name: data.group_name,
                room_id: roomId,
                messages: [],
                type: ChatTypeEnum.OneVersesMany,
            }
        });

        return chat;
    };

    getGroupChat = async (
        query: {
            page: number,
            size: number
        },
        groupId: string
    ) => {
        const {
            page,
            size
        } = query;

        return await this.chatRepo.findOneChat({
            filter: {
                _id:groupId

            },
            projection: {},
            options: {
                lean: false,
                populate: "participants"
            },
            page,
            size
        });
    };
}


const chatService = new ChatService();

export default chatService;
