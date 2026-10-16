import { Router } from "express";
import { auth } from "../../middleware/auth.middlware";
import { getUserChat, createGroup,getGroup } from "./chat.controller";
import { validation } from "../../middleware";


const chatRouter = Router({
    mergeParams:true
});

chatRouter.use(auth);
// ======================================================
// CREATE POST
// ======================================================
chatRouter.get(
    "/",
    getUserChat
);

chatRouter.post(
    "/group",
    createGroup
);
chatRouter.get(
    "/group/:groupId",
    getGroup
);
export default chatRouter;
