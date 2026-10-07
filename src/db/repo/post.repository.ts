import { Post } from '../models/post.model';
import { IPost } from '../../common/interfaces/post.interface';
import { BaseRepository } from './base.repository';
export class PostRepository extends BaseRepository<IPost> {
    constructor() {
        super(Post, "Post");
    }
}