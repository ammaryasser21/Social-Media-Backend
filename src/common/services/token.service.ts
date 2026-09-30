
import jwt, {
  Jwt,
  JwtPayload,
  SignOptions,
} from "jsonwebtoken";

import { randomUUID } from "node:crypto";
import { Roles } from "../enums/roles.js";
import { tokenTypes } from "../enums/token.js";
import { BadRequestResponse, ErrorResponse } from "../response/error-response.js";
import { Credentials, GenerateTokenOptions, TokenPayload, TokenSecrets, UserCredentialsInput, VerifyTokenResult } from "../interfaces/token.interface.js";
import { redisService } from "./redis.repository.js";
import { FlattenMaps, HydratedDocument } from "mongoose";
import { IUser } from "../interfaces/user.interface.js";
import StatusCodes from "../enums/status.js";

class TokenService {
  private redisService: any;
  constructor() {
    this.redisService = redisService;
  }

  getRequiredSecret = (
    key: string
  ): string => {

    const secret = process.env[key];

    if (!secret) {
      throw new Error(
        `${key} is missing from environment variables`
      );
    }

    return secret;
  };


  // ==========================================
  // Detect User Keys
  // ==========================================

  detectUserKeys = (
    role: Roles
  ): TokenSecrets => {

    switch (role) {
      case Roles.USER:
        return {
          accessSecret: this.getRequiredSecret(
            "JWT_ACCESS_SECRET"
          ),

          refreshSecret: this.getRequiredSecret(
            "JWT_REFRESH_SECRET"
          ),
        };

      case Roles.ADMIN:
        return {
          accessSecret: this.getRequiredSecret(
            "JWT_ACCESS_SECRET_ADMIN"
          ),

          refreshSecret: this.getRequiredSecret(
            "JWT_REFRESH_SECRET_ADMIN"
          ),
        };
      default:
        throw new BadRequestResponse("Invalid Roles");

    }

  };


  // ==========================================
  // Generate Token
  // ==========================================

  generateToken = ({
    data = {},
    secret,
    expiresIn = "15m",
    audience = ["user"],
  }: GenerateTokenOptions): string => {

    const options: SignOptions = {
      expiresIn,
      issuer: process.env.ISSUER,
      audience,
    };

    return jwt.sign(
      data,
      secret,
      options
    );

  };


  // ==========================================
  // Decode Token
  // ==========================================

verifyToken = (
    token: string,
    secret: string,
    audience: string
): TokenPayload => {
    const issuer = process.env.ISSUER;

    if (!issuer) {
        throw new Error("ISSUER is missing from environment variables");
    }

    const decoded = jwt.verify(token, secret, {
        issuer,
        audience,
    });

    if (typeof decoded === "string" || !decoded) {
        throw new BadRequestResponse("Invalid token payload");
    }

    return decoded as TokenPayload;
};


  // ==========================================
  // Verify Token
  // ==========================================

decodeToken = async (
    token: string,
    tokenType: tokenTypes
): Promise<TokenPayload> => {
    const data = jwt.decode(token) as TokenPayload | null;

    if (!data || !data.role) {
        throw new BadRequestResponse("Invalid token");
    }

    const { accessSecret, refreshSecret } =
        this.detectUserKeys(data.role);

    const secret =
        tokenType === tokenTypes.ACCESS
            ? accessSecret
            : refreshSecret;

    return this.verifyToken(
        token,
        secret,
        data.role
    );
};


  // ==========================================
  // Create Credentials
  // ==========================================


  createCredentials = (
    user: HydratedDocument<IUser> 
  ): Credentials => {
    const jti = randomUUID();

    const {
      _id,
      role
    } = user;
    if (!_id || !role) throw new BadRequestResponse("User not found");

    const {
      accessSecret,
      refreshSecret,
    } = this.detectUserKeys(role);

    const payload = {
      id: _id,
      role,
      jti,
    };

    return {
      accessToken: this.generateToken({
        data: payload,
        secret: accessSecret,
        expiresIn: "1h",
        audience: [role],
      }),

      refreshToken: this.generateToken({
        data: payload,
        secret: refreshSecret,
        expiresIn: "7d",
        audience: [role],
      }),
    };
  };
}

export const tokenService = new TokenService();
export type TokenServiceType = typeof tokenService;