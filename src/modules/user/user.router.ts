import { Router } from "express";
import { getProfile } from "./user.controller";
const authRouter = Router();

authRouter.get("/", getProfile)

export default authRouter;