import { Chat } from '../models/chat.model';
import { IChat } from '../../common/interfaces/chat.interface';
import { BaseRepository } from './base.repository';
export class ChatRepository extends BaseRepository<IChat> {
    constructor() {
        super(Chat, "Chat");
    }
}