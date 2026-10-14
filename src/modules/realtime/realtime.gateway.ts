import { redisService } from './../../common/services/redis.service';
import { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "../../middleware/auth.middlware";
import { NextFunction } from 'express';
import { NotFoundResponse, UnauthorizedResponse } from '../../common/response';
import { tokenService } from '../../common/services/token.service';
import { tokenTypes } from '../../common/enums/token';
import { userRepo } from '../../db/repo/user.repository';

class RealTimeGateway {
    private redisService;
    private tokenService;
    private userRepo;
    private io!: Server;
    constructor() {
        this.redisService = redisService;
        this.tokenService = tokenService;
        this.userRepo = userRepo;
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

        const adminNamespace = this.io.of("/admin");
        adminNamespace.use(this.socketAuthMiddleware);

        // let socketIds=[];
        adminNamespace.on("connection", async (socket) => {
            const user = socket.data.user;

            // socketIds.push(socket.id);

            await this.redisService.setSocket(user.id, socket.id);
            //Receive
            socket.on("sayHi", (data, cb) => {

                //recived data / message
                console.log({ data });

                //Hand shake - Receive sign
                //cb("Got message");

                //send to spacific user that associated with socket 
                //socket.emit("sayHi", `Hello ${socket.id}`);

                //send to spacific user
                //io.to(socket.id).emit("response", `Hello ${socket.id}`);

                //send to list of users
                //io.to(socketIds.slice(0,1)).emit("response",`Hello ${socketIds.join(" - ")}`);

                //send to all users
                //io.emit("response","Hello All");

                //send to all with excluding user associated with soket
                //socket.broadcast.emit("response",`Hello All exept ${socket.id}`);

                //send to all with excluding spacific user
                //io.except(socket.id).emit("response",`Hello All expet ${socket.id}`);

                //send to all with excluding spacific List of users
                //io.except(socketIds.slice(0,1)).emit("response",`Hello All expet ${socketIds.slice(0,1).join(" - ")}`);

            })

            socket.on("disconnect", async (data) => {
                console.log({ data });

                await this.redisService.deleteSocket(user.id, socket.id);
            })
        })

    }
}

export const realTimeGateway = new RealTimeGateway();