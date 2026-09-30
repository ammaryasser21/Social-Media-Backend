import { Post } from './../models/post.model';
import { IPost } from '../../common/interfaces/post.interface';
import { BaseRepositry } from './base.repositry';
export class PostRepositry extends BaseRepositry<IPost>{
    constructor(){
        super(Post,"Post");
    }
}