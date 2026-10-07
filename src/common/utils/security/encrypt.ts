import crypto from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

const ALGORITHM = "aes-256-cbc" as const;

const IV_LENGTH = 16;

const encryptionKey = process.env.ENCRYPTION_KEY;

if (!encryptionKey) {
    throw new Error(
        "ENCRYPTION_KEY is missing from environment variables"
    );
}

const KEY = Buffer.from(encryptionKey, "hex");

if (KEY.length !== 32) {
    throw new Error(
        "ENCRYPTION_KEY must contain exactly 32 bytes (64 hex characters)"
    );
}

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

    if (!ivHex || !encrypted) {
        throw new Error("Invalid encrypted value");
    }

    const iv = Buffer.from(ivHex, "hex");

    if (iv.length !== IV_LENGTH) {
        throw new Error("Invalid encryption IV");
    }

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        KEY,
        iv
    );

    let decrypted = decipher.update(
        encrypted,
        "hex",
        "utf8"
    );

    decrypted += decipher.final("utf8");

    return decrypted;
};