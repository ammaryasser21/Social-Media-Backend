import { IUser } from "../../common/interfaces/user.interface";
import { BadRequestResponse, NotFoundResponse } from "../../common/response";
import { redisService, RedisServiceType } from "../../common/services/redis.repository";
import { tokenService, TokenServiceType } from "../../common/services/token.service";
import { decrypt } from "../../common/utils/security/encrypt";
import { UserHydrated } from "../../db/models/user.model";
import { UserRepositry } from "../../db/repo/user.repositry";

class UserService {
    private userRepo: UserRepositry;
    private redisService: RedisServiceType;
    private tokenService: TokenServiceType;

    constructor() {
        this.userRepo = new UserRepositry();
        this.redisService = redisService;
        this.tokenService = tokenService;
    }

    async updateUserImg(
        file: Express.Multer.File | undefined,
        user: UserHydrated
    ): Promise<UserHydrated> {
        if (!file) {
            throw new BadRequestResponse("No file uploaded");
        }

        const updatedUser = await this.userRepo.findOneAndUpdate({
            filter: { _id: user._id },
            update: { profile_image: file.finalPath }
        });
        if (!updatedUser) throw new NotFoundResponse("User not found");

        return updatedUser;
    }

    async updateUserCover(
        files: Express.Multer.File[] | undefined,
        user: UserHydrated
    ): Promise<UserHydrated> {
        if (
            !files ||
            !files.length
        ) throw new BadRequestResponse("No file uploaded");

        const coverImages = files.map(
            (file) => file.finalPath
        );

        const updatedUser = await this.userRepo.findOneAndUpdate({
            filter: { _id: user._id },
            update: { cover_img: coverImages }
        });

        if (!updatedUser) throw new NotFoundResponse("User not found");

        return updatedUser
    }
}

const userService = new UserService();
export default userService;