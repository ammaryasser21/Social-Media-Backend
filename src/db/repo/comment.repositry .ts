import { BaseRepositry } from './base.repositry';
import { Comment } from '../models/comment.model';
import { IComment } from '../../common/interfaces/comment.interface';
export class PostRepositry extends BaseRepositry<IComment> {
    constructor() {
        super(Comment, "Comment");
    }
}