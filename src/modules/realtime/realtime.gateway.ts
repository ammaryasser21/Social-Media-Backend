import { redisService } from './../../common/services/redis.service';
import { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "../../middleware/auth.middlware";
import { NextFunction } from 'express';
import { NotFoundResponse, UnauthorizedResponse } from '../../common/response';
import { tokenService } from '../../common/services/token.service';
import { tokenTypes } from '../../common/enums/token';
import { userRepo } from '../../db/repo/user.repository';
import chatGateway from '../chat/realtime/chat.gateway';

class RealTimeGateway {
    private redisService;
    private tokenService;
    private userRepo;
    private chatGateway;
    private io!: Server;
    constructor() {
        this.redisService = redisService;
        this.tokenService = tokenService;
        this.userRepo = userRepo;
        this.chatGateway = chatGateway
    }

    private socketAuthMiddleware = async (
        socket: Socket,
        next: (err?: Error) => void
    ) => {
        try {
            const authHeader =
                socket.handshake.auth.authorization ??
                socket.handshake.headers.authorization;

            if (typeof authHeader !== "string" || !authHeader) {
                throw new UnauthorizedResponse(
                    "Access Token is required"
                );
            }

            const [scheme, accessToken] = authHeader.split(" ");

            if (scheme !== "Bearer" || !accessToken) {
                throw new UnauthorizedResponse(
                    "Authorization header must be: Bearer <token>"
                );
            }

            const decoded = await this.tokenService.decodeToken(
                accessToken,
                tokenTypes.ACCESS
            );

            const { id, jti, iat } = decoded;

            if (!id || !jti || !iat) {
                throw new UnauthorizedResponse(
                    "Invalid access token"
                );
            }

            const tokenExists = await this.redisService.getToken({
                userId: id,
                tokenSigniture: jti,
            });

            if (tokenExists) {
                throw new UnauthorizedResponse(
                    "Please login again"
                );
            }

            const user = await this.userRepo.findOne({
                filter: { _id: id },
            });

            if (!user) {
                throw new NotFoundResponse("User not found");
            }

            socket.data.user = user;

            next();
        } catch (error) {

            next(
                error instanceof Error
                    ? error
                    : new Error("Socket authentication failed")
            );
        }
    };


    initialize = (httpServer: any) => {
        this.io = new Server(httpServer, {
            cors: {
                origin: "*"
            }
        });

        const puplicNamespace = this.io.of("/");
        puplicNamespace.use(this.socketAuthMiddleware);

        puplicNamespace.on("connection", async (socket) => {
            const user = socket.data.user;

            await this.redisService.setSocket(user.id, socket.id);
            await this.chatGateway.registerEvents(socket,this.io);

            socket.on("disconnect", async (data) => {
                await this.redisService.deleteSocket(user.id, socket.id);
            })
        })




    }
}

export const realTimeGateway = new RealTimeGateway();