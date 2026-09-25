import bcrypt from "bcrypt";
import crypto from "node:crypto";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

export const hashValue = async (
  value: string
): Promise<string> => {

  return bcrypt.hash(
    String(value),
    SALT_ROUNDS
  );

};

export const hashToken = (
  token: string
): string => {

  return crypto
    .createHash("sha256")
    .update(token, "utf8")
    .digest("hex");

};

export const compareHash = async (
  value: string,
  hashedValue: string
): Promise<boolean> => {

  return bcrypt.compare(
    String(value),
    hashedValue
  );

};