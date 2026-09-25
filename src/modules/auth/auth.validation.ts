
import { email, z } from "zod";
import { Roles } from "../../common/enums/roles";

export const loginSchema = {
  body: z.strictObject({
    email: z
      .email()
      .trim(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  }),
};


export const signUpSchema = {
  body: loginSchema.body.safeExtend({
    username: z
      .string()
      .optional(),

    age: z
      .int()
      .gte(18)
      .lte(60),

    phone: z
      .string()
      .optional(),
  })
}

