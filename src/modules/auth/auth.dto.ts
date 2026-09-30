import { z } from "zod";
import { googleLoginSchema, loginSchema, signUpSchema } from "./auth.validation";

//option 1 dynamic
// type IloginType= typeof loginSchema;

// type IloginKeys=keyof IloginType;//body | parms | ...

// export type Ilogin = {
//   [K in IloginKeys]: z.infer<(IloginType)[K]>;
// };

//option 2 easiest

// export type Ilogin = {
//   body: z.infer<typeof loginSchema.body>;
// };

//option 3
export type Ilogin=z.infer<typeof loginSchema.body>;

export type ISignUp=z.infer<typeof signUpSchema.body>;

export type IgoogleLogin=z.infer<typeof googleLoginSchema.body>;