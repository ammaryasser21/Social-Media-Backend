import { User } from '../models/user.model';
import { IUser } from '../../common/interfaces/user.interface';
import { BaseRepository } from './base.repository';
export class UserRepository extends BaseRepository<IUser> {
    constructor() {
        super(User, "User");
    }
}