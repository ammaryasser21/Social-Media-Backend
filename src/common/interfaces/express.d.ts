import { IUser } from "../common/interfaces/user.interface";
import { TokenPayload } from "../common/interfaces/token.interface";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      payload?: TokenPayload;
    }
  }

  namespace Express {
        namespace Multer {
            interface File {
                finalPath?: string;
            }
        }
    }
}


export {};