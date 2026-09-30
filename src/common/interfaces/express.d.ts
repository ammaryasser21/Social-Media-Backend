import { IUser } from "./user.interface";
import { TokenPayload } from "./token.interface";

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
            payload?: TokenPayload;
        }

        namespace Multer {
            interface File {
                finalPath?: string;
            }
        }
    }
}

export {};