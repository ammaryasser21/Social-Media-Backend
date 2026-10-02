import express, { Express, NextFunction, Request, Response } from "express";
// import "dotenv/config";
import { config } from "dotenv";
import cors from "cors";
import { authRouter } from "./modules";
import { userRouter } from "./modules";
import { globalErrorHandler } from "./middleware";
import { successResponse } from "./common/response";
import { join } from "node:path";
import helmet from "helmet";
import { limiter } from "./middleware";
import DBconnection from "./db/connection";
import { redisService } from "./common/services/redis.service";
import { auth } from "./middleware/auth.middlware";
import s3Service from "./common/services/s3.service";
import { pipeline } from "node:stream/promises";
const bootstrap = async () => {

    config({
        path: ".env"
    })


    await DBconnection();
    await redisService.connection();

    const app: Express = express();


    app.use(express.json());

    //This will add header x-forword-for in my req this header give me ip for the device
    const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 0);
    app.set("trust proxy", trustProxyHops);


    // Apply the rate limiting middleware to all requests.
    app.use(limiter);


    const frontendUrl = process.env.FRONTEND_URL;

    app.use(
        cors({
            origin: (origin, callback) => {
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

    // app.use("/uploads/*path", async (
    //     req: Request,
    //     res: Response,
    //     next: NextFunction
    // ) => {

    //     const path = (req.params?.path as string[]).join("/");

    //     const result = await s3Service.getFile({
    //         fileName: path
    //     })

    //     await pipeline(result.Body as NodeJS.ReadableStream, res)

    // }

    // );

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
        auth,
        userRouter
    );

    app.use(globalErrorHandler);

    app.listen(Number(process.env.PORT) || 3000, () => {
        console.log("server is runing");
    })

}

export default bootstrap;