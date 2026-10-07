import { AnyUpload } from './common/interfaces/multer.interface';
import express, { Express, NextFunction, Request, Response } from "express";
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
import { GraphQLEnumType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
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




    var schema = new GraphQLSchema({
        // Query For getting data
        query: new GraphQLObjectType({
            // Every Object should have name and Object of fields
            name: 'RootQueryType',
            fields: {
                //Here all Quiries
                hello: {
                    // Type Like string or boolen or object BUT in graphql types
                    type: GraphQLString,
                    // Ues args object to take input from user
                    args: {
                        name: {
                            type: new GraphQLNonNull(GraphQLString),
                            // defaultValue:"UserName"
                        },
                    },
                    // Can accessing Args here from args
                    resolve(
                        parent: any,
                        args: any,
                        context: AnyUpload
                    ) {
                        //Logic here
                        return `hello ${args.name}`;
                    },
                },

                // age: {
                //     type: GraphQLInt,
                //     resolve() {
                //         return 10
                //     }
                // },

                // getUser: {
                //     type: new GraphQLList(
                //         new GraphQLObjectType({
                //             name: "UserInfo",
                //             fields: {
                //                 name: { type: new GraphQLNonNull(GraphQLString) },
                //                 age: { type: GraphQLInt },
                //                 role: {
                //                     type: new GraphQLEnumType({
                //                         name: "userRole",
                //                         values: {
                //                             ADMIN: {
                //                                 value: "admin"
                //                             },
                //                             USER: {
                //                                 value: "user"
                //                             },
                //                         }

                //                     }),
                //                 }
                //             }
                //         }),
                //     ),
                //     resolve() {
                //         return [
                //             {
                //                 name: "ammar",
                //                 age: 23,
                //                 role: "user"
                //             },
                //             {
                //                 name: "ammar",
                //                 age: 23,
                //                 role: "admin"
                //             },
                //         ]
                //     }
                // }
            },
        }),
        // mutation: new GraphQLObjectType({
        //     // Every Object should have name and Object of fields
        //     name: 'RootMutatuiomType',
        //     fields: {
        //         //Here all Quiries
        //         hello: {
        //             // Type Like string or boolen or object BUT in graphql types
        //             type: GraphQLString,
        //             resolve() {
        //                 //Logic here
        //                 return 'world';
        //             },
        //         },

        //         age: {
        //             type: GraphQLInt,
        //             resolve() {
        //                 return 10
        //             }
        //         }
        //     },
        // }),
        // Mustation for update and delete and create
        // Subscription
    });

    app.all(
        "/graphql",
        createHandler({ schema })
    );


    app.use(globalErrorHandler);

    app.listen(Number(process.env.PORT) || 3000, () => {
        console.log("server is runing");
    })

}

export default bootstrap;