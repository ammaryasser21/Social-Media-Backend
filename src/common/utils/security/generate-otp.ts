import { randomInt } from "node:crypto";

export const generateOtp = (): string => {
    return String(randomInt(100000, 1000000));
};