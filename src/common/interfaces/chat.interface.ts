import { Types } from "mongoose";

export enum ChatTypeEnum {
  OneVersesOne = 'ovo',
  OneVersesMany = 'ovm'
}

export interface IMessage {
  content: string;
  attachment?: string[];
  createdBy: Types.ObjectId;
  likes?: Types.ObjectId[];
  tags?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type IChat = {
  participants: Types.ObjectId[];
  createdBy: Types.ObjectId;
  messages: IMessage[];
  type: ChatTypeEnum;

  group_name?:string;
  group_image?:string;
  room_id?:string;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  restoredAt?: Date;
};