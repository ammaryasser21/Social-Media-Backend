import { BaseRepository } from './base.repository';
import { Comment } from '../models/comment.model';
import { IComment } from '../../common/interfaces/comment.interface';
export class CommentRepository extends BaseRepository<IComment> {
    constructor() {
        super(Comment, "Comment");
    }
}