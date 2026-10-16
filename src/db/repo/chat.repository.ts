import { Chat, ChatHydrated } from '../models/chat.model';
import { IChat } from '../../common/interfaces/chat.interface';
import { BaseRepository } from './base.repository';
import { ProjectionType, QueryFilter, QueryOptions } from 'mongoose';
export class ChatRepository extends BaseRepository<IChat> {
    constructor() {
        super(Chat, "Chat");
    }

    async findOneChat({
        filter,
        projection,
        options,
        page,
        size,
    }: {
        filter?: QueryFilter<IChat>;
        projection?: ProjectionType<IChat> | null | undefined;
        options?: QueryOptions<IChat>;
        page?: number;
        size?: number;
    }): Promise<ChatHydrated | null> {
        const currentPage = page ?? 1;
        size = size ?? 5;
        const chat = await Chat.findOne(
            filter,
            {
                messages: {
                    $slice: [-(currentPage * size), size],
                },
            }, options);
        return chat;
    }

}