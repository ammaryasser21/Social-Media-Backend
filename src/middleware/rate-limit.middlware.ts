import geoip from "geoip-lite";
import {
    ipKeyGenerator,
    rateLimit,
    type Store,
    type IncrementResponse,
} from "express-rate-limit";

import { successResponse } from "../common/response";
import StatusCodes from "../common/enums/status";
import { redisService } from "../common/services/redis.repository";


// =========================
// Custom Redis Store
// =========================

const redisStore: Store = {

    async increment(key: string): Promise<IncrementResponse> {

        const totalHits = await redisService.incr({ key });

        return {
            totalHits,
            resetTime: new Date(Date.now() + 60 * 1000),
        };
    },


    async decrement(key: string): Promise<void> {

        await redisService.decr({ key });
    },


    async resetKey(key: string): Promise<void> {

        await redisService.delete({ key });
    },

};


// =========================
// Rate Limiter
// =========================

export const limiter = rateLimit({

    windowMs: 60 * 1000,

    limit: async (req): Promise<number> => {

        const countryCode = geoip.lookup(req.ip ?? "")?.country;

        return countryCode === "EG" ? 5 : 0;
    },


    message: "Too many requests, try again after 1 minute",

    statusCode: StatusCodes.CLIENT_ERROR.TOO_MANY_REQUESTS,

    legacyHeaders: false,

    requestPropertyName: "rateLimit",


    handler: (req, res) => {

        // Client can retry after 60 seconds
        res.set("Retry-After", "60");

        return successResponse({
            res,
            message: "Too many requests, try again after 1 minute",
            status: StatusCodes.CLIENT_ERROR.TOO_MANY_REQUESTS,
        });
    },


    keyGenerator: (req) => {

        const ip = ipKeyGenerator(
            req.ip ?? "unknown",
            56
        );

        return `${ip}-${req.path}`;
    },


    store: redisStore,

});