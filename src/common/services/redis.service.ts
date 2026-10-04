
import StatusCodes from "../enums/status.js";
import {
  DeleteManyParams,
  DeleteParams,
  ExistsParams,
  ExpireParams,
  GetParams,
  KeysParams,
  SetParams,
  SetTokenParams,
  TokenParams,
} from "../interfaces/redis.repo.interface.js";
import { ErrorResponse } from "../response/error-response.js";
import { createClient, RedisClientType } from "redis";
import { config } from "dotenv";

class RedisService {

  private redisClient: RedisClientType;
  constructor() {
    config();

    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error("REDIS_URL is missing from environment variables");
    }

    this.redisClient = createClient({
      url: redisUrl,
    });

    this.handleErrorEvent();
  }

  public async connection(): Promise<void> {
    if (this.redisClient.isOpen) {
      return;
    }

    try {
      await this.redisClient.connect();
      console.log("Redis connected successfully...");
    } catch (error) {
      console.error("Redis connection error:", error);
      throw new ErrorResponse(
        "Redis connection failed",
        StatusCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }

  private handleErrorEvent = (): void => {
    this.redisClient.on("error", (err) => {
      console.error("Redis client error:", err);
    });
  };

  async get({ key }: GetParams): Promise<unknown | null> {
    const result = await this.redisClient.get(key);

    if (result === null || result === undefined) {
      return null;
    }

    try {
      return JSON.parse(result as string);
    } catch {
      return result;
    }
  }


  async incr({ key }: GetParams): Promise<number> {
    return await this.redisClient.incr(key);
  }

  async incrWithExpire({
    key,
    ttl,
  }: {
    key: string;
    ttl: number;
  }): Promise<number> {
    const totalHits = await this.redisClient.incr(key);

    if (totalHits === 1) {
      await this.redisClient.expire(key, ttl);
    }

    return totalHits;
  }


  async decr({ key }: GetParams): Promise<number> {
    return await this.redisClient.decr(key);
  }


  async set({
    key,
    value,
    ttl,
  }: SetParams): Promise<void> {

    try {
      const serializedValue =
        typeof value === "string"
          ? value
          : JSON.stringify(value);

      if (ttl !== undefined) {
        await this.redisClient.set(key, serializedValue, {
          EX: ttl,
        });

      } else {
        await this.redisClient.set(key, serializedValue);
      }
    } catch (error) {
      throw new ErrorResponse("Internal server error", StatusCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR);

    }

  }


  async delete({
    key,
  }: DeleteParams): Promise<number> {
    return await this.redisClient.del(key);
  }


  async deleteMany({
    keys,
  }: DeleteManyParams): Promise<number> {
    if (!keys.length) {
      return 0;
    }
    return await this.redisClient.del(keys);
  }


  async exists({
    key,
  }: ExistsParams): Promise<number> {
    return await this.redisClient.exists(key);
  }


  async expire({
    key,
    seconds,
  }: ExpireParams): Promise<number> {
    return await this.redisClient.expire(key, seconds);
  }



  async ttl({
    key,
  }: GetParams): Promise<number> {
    return await this.redisClient.ttl(key);
  }


  async getToken({
    userId,
    tokenSigniture,
  }: TokenParams) {

    return this.get({
      key: this.createTokenKey({
        userId,
        tokenSigniture,
      }),
    });
  }


  async setToken({
    userId,
    tokenSigniture,
    value,
    ttl,
  }: SetTokenParams): Promise<void> {

    return this.set({
      key: this.createTokenKey({
        userId,
        tokenSigniture,
      }),
      value,
      ...(ttl !== undefined && { ttl }),
    });
  }


  async deleteToken({
    userId,
    tokenSigniture,
  }: TokenParams): Promise<number> {

    return this.delete({
      key: this.createTokenKey({
        userId,
        tokenSigniture,
      }),
    });
  }


  async deleteAllTokens({
    userId,
  }: {
    userId: string;
  }): Promise<number> {

    const keys = await this.keys({
      prefix: this.prefixTokenKey({
        userId,
      }),
    });

    return this.deleteMany({
      keys,
    });
  }


  async tokenExists({
    userId,
    tokenSigniture,
  }: TokenParams): Promise<number> {

    return this.exists({
      key: this.createTokenKey({
        userId,
        tokenSigniture,
      }),
    });
  }


  async keys({
    prefix,
  }: KeysParams): Promise<string[]> {
    return await this.redisClient.keys(`${prefix}*`);
  }



  prefixTokenKey = ({
    userId,
  }: {
    userId: string;
  }): string => `TOKEN::${userId}`;

  createTokenKey = ({
    userId,
    tokenSigniture,
  }: TokenParams): string =>
    `TOKEN::${userId}::${tokenSigniture}`;

  otpKey = ({
    email,
  }: {
    email: string;
  }): string => `OTP::${email}`;

  otpCountKey = ({
    email,
  }: {
    email: string;
  }): string => `OTP::COUNT::${email}`;

  forgetOtpKey = ({
    email,
  }: {
    email: string;
  }): string => `OTP::FORGET_PASSWORD::${email}`;

  forgetOtpRequestCountKey = ({
    email,
  }: {
    email: string;
  }): string => `OTP::FORGET_PASSWORD::REQUEST_COUNT::${email}`;

  forgetOtpAttemptCountKey = ({
    email,
  }: {
    email: string;
  }): string => `OTP::FORGET_PASSWORD::ATTEMPT_COUNT::${email}`;

  forgetTokenKey = ({
    token,
  }: {
    token: string;
  }): string => `TOKEN::FORGET_PASSWORD::${token}`;

  forgetTokenCountKey = ({
    email,
  }: {
    email: string;
  }): string => `TOKEN::FORGET_PASSWORD::COUNT::${email}`;

  FCMTokenKey = (user_id: string): string => {
    return `FCM::${user_id}`;
  }

  setFCMToken = async (
    user_id: string,
    token: string
  ) => {
    return await this.redisClient.sAdd(
      this.FCMTokenKey(user_id),
      token
    )
  }

  getFCMToken = async (
    user_id: string
  ) => {
    return await this.redisClient.sMembers(
      this.FCMTokenKey(user_id)
    )
  }

  deleteFCMToken = async (
    user_id: string,
    token: string
  ) => {
    return await this.redisClient.sRem(
      this.FCMTokenKey(user_id),
      token
    )
  }

}


export const redisService = new RedisService();
export type RedisServiceType = typeof redisService;