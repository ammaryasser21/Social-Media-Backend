import { Router } from "express";
import { login, signUp } from "./auth.controller";
import { validation } from "../../middleware/";
import { loginSchema, signUpSchema } from "./auth.validation";

const authRouter = Router();

/*
xRouter.<method>("Endpoint",
    Rate Limiting,
    Authentication,
    Validation,
    Authorization, 
    Controller
);
*/

authRouter.post(
    "/signup",
    validation(signUpSchema),
    signUp
)

authRouter.post(
    "/login",
    validation(loginSchema),
    login
);

export default authRouter;