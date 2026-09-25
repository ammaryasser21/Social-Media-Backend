
import StatusCodes from "../enums/status.js";
import { DeleteManyParams, DeleteParams, ExistsParams, ExpireParams, GetParams, KeysParams, SetParams, SetTokenParams, TokenParams } from "../interfaces/redis.repo.interface.js";
import { BadRequestResponse, ErrorResponse } from "../response/error-response.js";
import { createClient, RedisClient } from 'redis';
import { RedisClientType } from '@redis/client';
import { config } from "dotenv";


class RedisService {

  private redisClient: RedisClientType;
  constructor() {
    config();
    this.redisClient = createClient({
      url: process.env.REDIS_URL! as string,
    });


  }


  public async connection() {
    try {
      await this.redisClient.connect();
      console.log("Redis connected successfully...");
    } catch (error) {
      console.error("Redis connection error:", error);

    }

    this.handleErrorEvent();
  }

  private handleErrorEvent = () => {
    this.redisClient.on("error", (err) => {
      throw new ErrorResponse(
        err,
        StatusCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      );
    })

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

  forgetOtpCountKey = ({
    email,
  }: {
    email: string;
  }): string => `OTP::FORGET_PASSWORD::COUNT::${email}`;

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

}


export const redisService = new RedisService();
export type RedisServiceType = typeof redisService;