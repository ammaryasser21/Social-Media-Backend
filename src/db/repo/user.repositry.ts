import { User } from './../models/user.model';
import { IUser } from '../../common/interfaces/user.interface';
import { BaseRepositry } from './base.repositry';
export class UserRepositry extends BaseRepositry<IUser>{
    constructor(){
        super(User);
    }
}