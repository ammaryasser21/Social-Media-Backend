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
  password?: string | undefined;
  role?: Roles | undefined;
  gender?: Gender;
  is_active?: boolean;
  address?: IUserAddress;
  oldPasswords?: string[];
  cover_img?: string[];
  profile_image?: string | null;
  provider?: System;
  status?: userStatus;
  phone?: string | undefined;
  changeCredentials?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
  full_name?:string;
}