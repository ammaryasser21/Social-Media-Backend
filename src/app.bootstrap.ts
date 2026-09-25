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
const bootstrap = async () => {

    config({
        path: ".env"
    })

    const Port = process.env.PORT;


    await DBconnection();

    const app: Express = express();

    
    app.use(express.json());

    //This will add header x-forword-for in my req this header give me ip for the device
    app.set("trust proxy", true);


    // Apply the rate limiting middleware to all requests.
    app.use(limiter);


    // const whiteList = [`${process.env.FRONTEND_URL}`];
    app.use(cors({
        // origin:[`${process.env.FRONTEND_URL}`],
        // origin: function (origin, callback) {
        //     //this white list to avoid the undfind origin that comes from postman
        //     if (whiteList.includes(origin)) callback(null, true);
        //     callback(new Error("Invalid origin"));
        // },
        origin: "*",
        credentials: true, //cookies
        // allowedHeaders:["content-type"],
        // methods:["GET","POST"],
    }))

    //to protect your site
    app.use(helmet());

    app.use("/uploads",
        express.static(join(process.cwd(), "uploads"))
    );
    app.use(express.json());

    app.get("/", (req: Request, res: Response, next: NextFunction): void => {
        successResponse({
            res,
            message: "Hello World"
        });
    })

    app.use("/auth", authRouter);
    app.use("/user", userRouter);

    app.use(globalErrorHandler);

    app.listen(3000, () => {
        console.log("server is runing");
    })

}

export default bootstrap;