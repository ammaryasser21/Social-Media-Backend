import {
  Schema,
  model,
  type HydratedDocument,
} from "mongoose";

import { System } from "../../common/enums/system.js";
import { userStatus } from "../../common/enums/user_status.js";
import { Gender } from "../../common/enums/gender.js";
import { Roles } from "../../common/enums/roles.js";
import { IUser } from "../../common/interfaces/user.interface.js";

export type UserHydrated = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    first_name: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 20,
    },

    last_name: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 20,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 20,
    },

    confirmEmail: {
      type: Boolean,
      default: false,
    },

    age: {
      type: Number,
      min: 18,
      max: 60,
    },

    password: {
      type: String,
      trim: true,
      minLength: 3,
      select: false,
    },

    role: {
      type: String,
      enum: Roles,
      default: Roles.USER,
    },

    gender: {
      type: String,
      enum: Gender,
      default: Gender.MALE,
    },

    is_active: {
      type: Boolean,
      default: false,
    },

    address: {
      city: String,
      country: String,
    },

    oldPasswords: [String],

    cover_img: {
      type: [String],

      get: (value: string[] | undefined): string[] => {

        if (!value) {
          return [];
        }

        return value.map(
          (img) => `${process.env.BASE_URL}${img}`
        );
      },
    },

    profile_image: {
      type: String,

      get: (value: string | undefined): string | null => {

        if (!value) {
          return null;
        }

        return `${process.env.BASE_URL}${value}`;
      },
    },

    provider: {
      type: String,
      enum: System,
      default: System.SYSTEM,
    },

    status: {
      type: String,
      enum: userStatus,
      default: userStatus.APPROVED,
    },

    phone: {
      type: String,
      trim: true,
      minLength: 10,
    },

    changeCredentials: Date,
  },

  {
    timestamps: true,
    collection: "users",

    optimisticConcurrency: true,

    versionKey: "version",

    strict: true,
    strictQuery: true,

    toJSON: {
      virtuals: false,
      getters: true,
    },

    toObject: {
      virtuals: false,
      getters: true,
    },
  }
);


userSchema
  .virtual("full_name")
  .get(function (this: UserHydrated): string {

    return `${this.first_name ?? ""} ${this.last_name ?? ""}`.trim();
  })

  .set(function (this: UserHydrated, value: string) {

    const [firstName = "", lastName = ""] =
      value.trim().split(" ");

    this.first_name = firstName;
    this.last_name = lastName;
  });


export const User = model<IUser>("User", userSchema);