import { IUser } from "./user.interface";
import { TokenPayload } from "./token.interface";
import { STORAGE_TYPES } from "../enums/multer";

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

export { };