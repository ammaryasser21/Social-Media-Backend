import express, {
    Express,
    NextFunction,
    Request,
    Response
} from "express";
// import "dotenv/config";
import { config } from "dotenv";
import cors from "cors";
import { authRouter, postRouter } from "./modules";
import { userRouter } from "./modules";
import { globalErrorHandler } from "./middleware";
import { successResponse } from "./common/response";
import { join } from "node:path";
import helmet from "helmet";
import { limiter } from "./middleware";
import DBconnection from "./db/connection";
import { redisService } from "./common/services/redis.service";
import { createHandler } from "graphql-http/lib/use/express";
import schema from './modules/gql/schema.gql';
import { auth } from './middleware/auth.middlware';
import { Server } from "socket.io"
const bootstrap = async () => {

    config({
        path: ".env"
    })

    await DBconnection();
    await redisService.connection();

    const app: Express = express();

    app.use(express.json());

    const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 0);
    app.set("trust proxy", trustProxyHops);

    app.use(limiter);

    app.use(
        cors({
            origin: (origin, callback) => {
                const frontendUrl = process.env.FRONTEND_URL;
                // Allow non-browser clients such as Postman/curl.
                if (!origin) return callback(null, true);

                if (frontendUrl && origin === frontendUrl) {
                    return callback(null, true);
                }

                return callback(new Error("Invalid CORS origin"));
            },
            credentials: true,
        })
    );

    app.use(helmet());

    app.use("/uploads",
        express.static(join(process.cwd(), "uploads"))
    );

    app.get("/", (req: Request, res: Response, next: NextFunction): void => {
        successResponse({
            res,
            message: "Hello World"
        });
    })

    app.use(
        "/auth",
        authRouter
    );

    app.use(
        "/user",
        userRouter
    );

    app.use(
        "/post",
        postRouter
    );


    app.all(
        "/graphql",
        auth,
        createHandler({
            schema: schema,
            context: (req) => ({
                user: req.raw.user,
                payload: req.raw.payload
            }),
        })
    );


    app.use(globalErrorHandler);

    const httpServer = app.listen(Number(process.env.PORT) || 3000, () => {
        console.log("server is runing ....");
    })

    const io = new Server(httpServer,{
        cors:{
            origin:"*"
        }
    });


    let socketIds=[];
    io.of("/admin").on("connection", (socket) => {
        //Every soket connection has unique id
        console.log({ socket: socket.id });

        socketIds.push(socket.id);

        //Receive
        socket.on("sayHi", (data, cb) => {

            //recived data / message
            console.log({ data });

            //Hand shake - Receive sign
            cb("Got message");

            //send to spacific user that associated with socket 
            socket.emit("sayHi", `Hello ${socket.id}`);

            //send to spacific user
            io.to(socket.id).emit("response", `Hello ${socket.id}`);

            //send to list of users
            io.to(socketIds.slice(0,1)).emit("response",`Hello ${socketIds.join(" - ")}`);

            //send to all users
            io.emit("response","Hello All");

            //send to all with excluding user associated with soket
            socket.broadcast.emit("response",`Hello All exept ${socket.id}`);

            //send to all with excluding spacific user
            io.except(socket.id).emit("response",`Hello All expet ${socket.id}`);

            //send to all with excluding spacific List of users
            io.except(socketIds.slice(0,1)).emit("response",`Hello All expet ${socketIds.slice(0,1).join(" - ")}`);

        })

        socket.on("disconnect",(data)=>{
            console.log({data});
        })
    })

    console.log("app is runing ....");
}

export default bootstrap;