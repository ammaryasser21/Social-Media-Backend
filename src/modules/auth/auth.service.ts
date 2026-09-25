import { redisService, RedisServiceType } from './../../common/services/redis.repository';
import { BadRequestResponse } from '../../common/response';
import { otpEmail } from '../../common/templates/emails/otp';
import emailEmitter from '../../common/utils/emails/email-event';
import { sendEmail } from '../../common/utils/emails/mail';
import { encrypt } from '../../common/utils/security/encrypt';
import { compareHash, hashValue } from '../../common/utils/security/hash';
import { UserHydrated } from '../../db/models/user.model';
import { UserRepositry } from '../../db/repo/user.repositry';
import { Ilogin, ISignUp } from "./auth.dto";
import { generateOtp } from '../../common/utils/security/generate-otp';
import { tokenService, TokenServiceType } from '../../common/services/token.service';

class AuthService {
  private userRepo: UserRepositry;
  private redisService: RedisServiceType;
  private tokenService: TokenServiceType;
  constructor() {
    this.userRepo = new UserRepositry();
    this.redisService = redisService;
    this.tokenService = tokenService;
  }

  async login(data: Ilogin) {
    const {
      email,
      password
    } = data;

    const user = await this.userRepo.findOne({
      filter: { email },
      options: {
        lean: true
      }
    });

    if (!user) throw new BadRequestResponse("Invalid email or password");

    if (!await compareHash(password, user.password as string)) {
      throw new BadRequestResponse("Invalid email or password");
    }


    const {
      accessToken,
      refreshToken
    } = await this.tokenService.createCredentials(user as UserHydrated);

    return {
      accessToken,
      refreshToken
    };
  }

  async signUp(data: ISignUp) {
    const {
      email,
      password,
      phone
    } = data;

    const existUser: UserHydrated | null = await this.userRepo.findOne({
      filter: { email }
    });

    if (existUser) throw new BadRequestResponse("This email already existed");

    data.password = await hashValue(password);

    if (phone) data.phone = encrypt(phone);

    const user = await this.userRepo.create({ data });

    let otp = await generateOtp();

    const hashedOtp = await hashValue(otp);

    await this.redisService.set({
      key: this.redisService.otpKey({ email }),
      value: hashedOtp,
      ttl: 120
    });

    emailEmitter.emit("sendEmail", async () => {
      await sendEmail({
        to: email,
        subject: "Confirm email",
        html: otpEmail({
          name: user.first_name,
          otp,
          title: "Confirm email otp",
          expiresIn: "2 minutes"
        })
      });
    })

    return {
      user
    };
  }
}

const authService = new AuthService();

export default authService;