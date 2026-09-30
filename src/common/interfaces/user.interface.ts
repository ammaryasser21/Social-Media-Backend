import { Gender } from "../enums/gender";
import { Roles } from "../enums/roles";
import { System } from "../enums/system";
import { userStatus } from "../enums/user_status";

export interface IUserAddress {
  city?: string;
  country?: string;
}


export interface IUser {
    first_name?: string;
    last_name?: string;

    email: string;

    confirmEmail?: boolean;
    age?: number;

    password?: string;

    role: Roles;

    gender?: Gender;
    is_active?: boolean;
    address?: IUserAddress;
    oldPasswords?: string[];
    cover_img?: string[];
    profile_image?: string | null;
    provider?: System;
    status?: userStatus;
    phone?: string;
    changeCredentials?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    full_name?: string;
}