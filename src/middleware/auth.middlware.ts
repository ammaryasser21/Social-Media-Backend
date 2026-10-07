import { NextFunction, Request, Response } from "express";
import { Roles } from "../common/enums/roles";
import {
    ForbiddenResponse,
    NotFoundResponse,
    UnauthorizedResponse,
} from "../common/response";
import { tokenTypes } from "../common/enums/token";
import { tokenService } from "../common/services/token.service";
import { UserRepositry } from "../db/repo/user.repository";
import { redisService } from "../common/services/redis.service";

export const auth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userRepo = new UserRepositry();

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new UnauthorizedResponse("Access Token is required");
    }

    const [scheme, accessToken] = authHeader.split(" ");

    if (scheme !== "Bearer" || !accessToken) {
        throw new UnauthorizedResponse(
            "Authorization header must be: Bearer <token>"
        );
    }

    const decoded = await tokenService.decodeToken(
        accessToken,
        tokenTypes.ACCESS
    );

    const { id, jti, iat } = decoded;

    if (!id || !jti || !iat) {
        throw new UnauthorizedResponse("Invalid access token");
    }

    const tokenExists = await redisService.getToken({
        userId: id,
        tokenSigniture: jti,
    });

    if (tokenExists) {
        throw new UnauthorizedResponse("Please login again");
    }

    const user = await userRepo.findOne({
        filter: { _id: id },
    });

    if (!user) {
        throw new NotFoundResponse("User not found");
    }

    if (user.changeCredentials) {
        const logoutTime = Math.floor(
            user.changeCredentials.getTime() / 1000
        );

        if (logoutTime >= iat) {
            throw new UnauthorizedResponse("Please login again");
        }
    }



    req.user = user;
    req.payload = decoded;

    next();
};

export const authorize = (...roles: Roles[]) => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user) {
            throw new UnauthorizedResponse("Authentication required");
        }

        if (!req.user.role || !roles.includes(req.user.role)) {
            throw new ForbiddenResponse(
                "You are not allowed to access this resource"
            );
        }

        next();
    };
};