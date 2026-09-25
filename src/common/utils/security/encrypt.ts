import crypto from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

const ALGORITHM = "aes-256-cbc" as const;

const IV_LENGTH = 16;

const encryptionKey = process.env.ENCRYPTION_KEY;

const KEY: Buffer = Buffer.from(encryptionKey as string, "hex");


export const encrypt = (text: string): string => {
  const iv: Buffer = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    KEY,
    iv
  );

  let encrypted: string = cipher.update(
    text,
    "utf8",
    "hex"
  );

  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
};


export const decrypt = (encryptedText: string): string => {
  const [ivHex, encrypted] = encryptedText.split(":");


  const iv: Buffer = Buffer.from(ivHex as string, "hex");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    iv
  );

  let decrypted: string = decipher.update(
    encrypted as string,
    "hex",
    "utf8"
  );

  decrypted += decipher.final("utf8");

  return decrypted;
};