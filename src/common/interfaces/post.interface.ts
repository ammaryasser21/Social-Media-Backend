import { Types } from "mongoose";
import { AvailableEnum } from "../enums/available";

export interface IPost {
  content?: string;
  tags?: Types.ObjectId[];
  likes?: Types.ObjectId[];
  attachments?:string[];
  available:AvailableEnum;
  createdBy:Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  restoredAt?: Date;
}