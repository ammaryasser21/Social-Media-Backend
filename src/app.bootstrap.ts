import express, {
    Express,
    NextFunction,
    Request,
    Response
} from "express";
// import "dotenv/config";
import { config } from "dotenv";
import cors from "cors";
import { authRouter, chatRouter, postRouter } from "./modules";
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
import { auth, socketAuthMiddleware } from './middleware/auth.middlware';
import { Server } from "socket.io"
import { realTimeGateway } from "./modules/realtime/realtime.gateway";
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
    app.use(
        "/chat",
        chatRouter
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

    realTimeGateway.initialize(httpServer);

    console.log("app is runing ....");
}

export default bootstrap;