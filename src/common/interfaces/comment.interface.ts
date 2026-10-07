import { Types } from "mongoose";

export interface IComment {
  post_id: Types.ObjectId;
  reply_to?: Types.ObjectId;
  content?: string;
  tags?: Types.ObjectId[];
  likes?: Types.ObjectId[];
  attachments?: string[];
  createdBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  restoredAt?: Date;
}