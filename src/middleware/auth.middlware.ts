import { NextFunction, Request, Response } from "express";
import { Roles } from "../common/enums/roles";
import { IUser } from "../common/interfaces/user.interface";
import { BadRequestResponse, ErrorResponse, ForbiddenResponse, NotFoundResponse } from "../common/response";
import { tokenTypes } from "../common/enums/token";
import { tokenService } from "../common/services/token.service";
import { UserRepositry } from "../db/repo/user.repositry";
import StatusCodes from "../common/enums/status";
import { TokenPayload } from "../common/interfaces/token.interface";
import { redisService } from "../common/services/redis.repository";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    const userRepo = new UserRepositry();
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new BadRequestResponse("Access Token is required");

    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) throw new BadRequestResponse("Access Token is required");


    const decoded = await tokenService.decodeToken(
        accessToken,
        tokenTypes.ACCESS
    );

    const {
        id,
        jti,
        iat,
    } = decoded;



    const user = await userRepo.findOne({
        filter: {
            _id: id
        }
    });
    if (!user) throw new NotFoundResponse("User not found");

    if (user.changeCredentials) {
        if (!iat) {
            throw new BadRequestResponse("Invalid access token");
        }

        const loginTime = iat;

        //user.changeCredentials.getTime() return ms while iat in s not ms so should divide on 1000
        const logoutTime = Math.floor(user.changeCredentials.getTime() / 1000);

        if (logoutTime >= loginTime) {
            throw new BadRequestResponse("Please login again");
        }
    }

    // const tokenExisted = await redisService.getToken({
    //     userId: id,
    //     tokenSigniture: jti
    // })


    if (jti) throw new BadRequestResponse("Please login again");

    req.user = user;
    req.payload = decoded;

    next();
};


export const authorize = (...roles: Roles[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            throw new ForbiddenResponse("You are not allowed to access this resource");
        }

        next();
    }
}