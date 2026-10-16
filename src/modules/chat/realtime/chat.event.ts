import { redisService } from './../../../common/services/redis.service';
import { Server, Socket } from "socket.io"
import { SocketValidation } from "../../../middleware/validation.middlware";
import { sayHiSchema, sendGroupMessageSchema, sendMessageSchema } from "../chat.validation";
import { BadRequestResponse } from "../../../common/response";
import { mapSocketError } from "../../../common/utils/socket-error.mapper";
import chatService from "../chat.service";

class ChatEvent {
    private chatService;
    private redisService;
    constructor() {
        this.chatService = chatService;
        this.redisService = redisService;

    }

    sayHi = (socket: Socket) => {
        socket.on("sayHi", async (data, cb) => {
            try {
                SocketValidation(sayHiSchema, data);

                const response = {
                    success: true,
                    message: `hello ${socket.data.user?.email}`,
                };

                socket.emit("response", response);
                cb?.(response);
            } catch (error: unknown) {
                const payload = mapSocketError(error);

                socket.emit("custom_error", payload);
                cb?.(payload);
            }
        });
    };

    sendMessage = (socket: Socket, io: Server) => {
        socket.on("sendMessage", async (data, cb) => {
            let userSockets: string[] = [];
            let receiverSockets: string[] = [];
            try {
                const user = socket.data.user;
                SocketValidation(sendMessageSchema, data);

                await this.chatService.sendMessage(data, user);

                userSockets = await this.redisService.getSocket(user._id);
                receiverSockets = await this.redisService.getSocket(data.sendTo);

                if (userSockets.length) io.to(userSockets).emit("successMessage", data);
                if (receiverSockets.length) socket.to(receiverSockets).emit("newMessage", {
                    content: data.content,
                    from: user
                });

                // cb?.(data);
            } catch (error: unknown) {
                const payload = mapSocketError(error);

                io.to(userSockets).emit("custom_error", payload);
                // cb?.(payload);
            }
        });
    };

    joinGroupRoom = (socket: Socket, io: Server) => {
        socket.on("join_room", async (data, cb) => {
            let userSockets: string[] = [];
            let receiverSockets: string[] = [];
            try {
                await this.chatService.getGroupChatByRoomId(data.roomId);
                socket.join(data.roomId);

                // cb?.(data);
            } catch (error: unknown) {
                const payload = mapSocketError(error);

                io.to(userSockets).emit("custom_error", payload);
                // cb?.(payload);
            }
        });
    };

    sendGroupMessage = (socket: Socket, io: Server) => {
        socket.on("sendGroupMessage", async (data, cb) => {
            let userSockets: string[] = [];
            let receiverSockets: string[] = [];
            try {
                const user = socket.data.user;
                SocketValidation(sendGroupMessageSchema, data);

                const chat=await this.chatService.sendGroupMessage(data.groupId, user);

                userSockets = await this.redisService.getSocket(user._id);
                // receiverSockets = await this.redisService.getSocket(data.sendTo);

                if (userSockets.length) io.to(userSockets).emit("successMessage", {
                    content: data.content,
                    sendTo: data.groupId
                });
                socket.to(chat.room_id as string).emit("newMessage", {
                    content: data.content,
                    from: user,
                    groupId:chat._id
                });

                // cb?.(data);
            } catch (error: unknown) {
                const payload = mapSocketError(error);

                io.to(userSockets).emit("custom_error", payload);
                // cb?.(payload);
            }
        });
    };
}
const chatEvent = new ChatEvent();
export default chatEvent;