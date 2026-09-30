
import { z } from "zod";
import { Types } from "mongoose";
import { Roles } from "../enums/roles";
import { MIME_TYPES } from "../enums/multer";

export const fullNameSchema = z
  .string({ error: "Full name must be a string" })
  .trim()
  .min(3, "Full name must be at least 3 characters long")
  .max(30, "Full name must be at most 30 characters long");

export const emailSchema = z
  .email("Email must be a valid email address")
  .trim();

export const passwordSchema = z
  .string({ error: "Password must be a string" })
  .min(6, "Password must be at least 6 characters long");

export const phoneSchema = z
  .string({ error: "Phone number must be a string" })
  .regex(
    /^[0-9]{11}$/,
    "Phone number must be an 11-digit number"
  );

export const ageSchema = z
  .number({ error: "Age must be a number" })
  .int("Age must be an integer")
  .min(18, "Age must be at least 18")
  .max(100, "Age must be at most 100");

export const roleSchema = z.enum(
  Object.values(Roles) as [
    string,
    ...string[]
  ],
  {
    error: "Invalid role"
  }
).default(Roles.USER);

export const isActiveSchema = z.preprocess(
  (value) => {
    if (value === 1 || value === true) return true;

    if (value === 0 || value === false) return false;

    return value;
  },
  z.boolean({
    error: "is_active must be a boolean"
  })
).default(true);

export const fileSchema = z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number().nonnegative(),

    destination: z.string().optional(),
    filename: z.string().optional(),
    path: z.string().optional(),

    finalPath: z.string().optional(),

    buffer: z.instanceof(Buffer).optional(),
}).strict();

export const imageFileSchema = fileSchema.extend({
    mimetype: z.enum(
        Object.values(MIME_TYPES.IMAGE) as [
            string,
            ...string[]
        ]
    ),
});



export const otpSchema = z
  .string()
  .length(6, "OTP must be exactly 6 characters")
  .regex(
    /^[0-9]+$/,
    "OTP must contain only numbers"
  );

export const generalSchema = {
  full_name: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string({
    error: "Confirm password must be a string"
  }),
  phone: phoneSchema,
  age: ageSchema,
  role: roleSchema,
  is_active: isActiveSchema,
  file: fileSchema.optional(),
  otp: otpSchema.optional(),
};

export const userIdSchema = z.object({
  params: z.object({
    userId: z.string().min(1, "User ID is required"),
  }).strict(),
}).strict();

export const objectIdSchema = z.string().refine(
  (value) => Types.ObjectId.isValid(value),
  {
    message: "Invalid ID"
  }
);

export const passwordMatchSchema = z
  .object({
    password: passwordSchema,

    confirmPassword: z.string({
      error: "Confirm password must be a string"
    }),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Confirm password must match the password",
    }
  );