import { z } from "zod";
import { emailSchema, generalSchema, otpSchema } from "../../common/utils/general-validate-schema";

export const loginSchema = {
  body: z.strictObject({
    email: z
      .email()
      .trim(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    FCM_Token:z
    .string()
    .optional()
  }),
};


export const signUpSchema = {
    body: z
        .strictObject({
            first_name: z
                .string()
                .trim()
                .min(3)
                .max(20),

            last_name: z
                .string()
                .trim()
                .min(3)
                .max(20),

            email: emailSchema,

            password: generalSchema.password,

            confirmPassword: generalSchema.confirmPassword,

            phone: generalSchema.phone,

            age: generalSchema.age,
        })
        .superRefine((data, ctx) => {
            if (data.password !== data.confirmPassword) {
                ctx.addIssue({
                    code: "custom",
                    path: ["confirmPassword"],
                    message: "Passwords do not match",
                });
            }
        }),
};


export const confirmSchema = {
  body: z.strictObject({
    email: emailSchema,
    otp: otpSchema,
  }),
};


export const resendConfirmSchema = {
    body: z.strictObject({
        email: emailSchema,
    }),
};


export const forgotPasswordOtpSchema = {
  body: z.object({
    email: generalSchema.email,
  }),
};


export const verifyForgotPasswordSchema = {
  body: z.object({
    email: generalSchema.email,
    otp: generalSchema.otp,
  }),
};


export const forgotPasswordSchema = {
  body: z.object({
    email: generalSchema.email,
  }),
};


export const updatePasswordSchema = {
  body: z
    .object({
      oldPassword: z.string(),

      newPassword: generalSchema.password,

      confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      // New password must be different from old password
      if (data.newPassword === data.oldPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["newPassword"],
          message: "New password must be different from old password",
        });
      }

      // Confirm password must match new password
      if (data.confirmPassword !== data.newPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Passwords do not match",
        });
      }
    }),
};


export const resetPasswordOtpSchema = {
  body: z
    .object({
      email: generalSchema.email,
      otp: generalSchema.otp,
      password: generalSchema.password,
      confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.confirmPassword !== data.password) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Passwords do not match",
        });
      }
    }),
};


export const resetPasswordLinkSchema = {
  body: z
    .object({
      token: z.string(),
      password: generalSchema.password,
      confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.confirmPassword !== data.password) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Passwords do not match",
        });
      }
    }),
};


export const googleLoginSchema = {
  body: z.object({
    code: z
      .string()
      .min(1, "Google authorization code is required"),
  })
}



export const signupSchema = {
  body: z.object({
    full_name: generalSchema.full_name,
    email: generalSchema.email,
    password: generalSchema.password,
    confirmPassword: generalSchema.confirmPassword,
    phone: generalSchema.phone,
    age: generalSchema.age,
  }),
};