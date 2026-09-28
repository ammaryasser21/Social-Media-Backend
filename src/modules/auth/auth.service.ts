import { 
  redisService, 
  RedisServiceType 
} from './../../common/services/redis.repository';

import { 
  BadRequestResponse, 
  NotFoundResponse, 
  successResponse, 
  UnauthorizedResponse 
} from '../../common/response';

import { otpEmail } from '../../common/templates/emails/otp';
import emailEmitter from '../../common/utils/emails/email-event';
import { sendEmail } from '../../common/utils/emails/mail';
import { encrypt } from '../../common/utils/security/encrypt';

import { 
  compareHash, 
  hashToken, 
  hashValue 
} from '../../common/utils/security/hash';

import { UserHydrated } from '../../db/models/user.model';
import { UserRepositry } from '../../db/repo/user.repositry';

import { 
  Ilogin, 
  ISignUp 
} from "./auth.dto";

import { generateOtp } from '../../common/utils/security/generate-otp';

import { 
  tokenService, 
  TokenServiceType 
} from '../../common/services/token.service';

import { 
  ConfirmEmailType, 
  PasswordType 
} from '../../common/interfaces/user-service.interface';

import { System } from '../../common/enums/system';
import { passwordChangedEmail } from '../../common/templates/emails/password-changed';
import generateResetToken from '../../common/utils/security/generate-reset-token';
import { config } from 'dotenv';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import { tokenTypes } from '../../common/enums/token';
import { resetPasswordEmail } from '../../common/templates/emails/reset-password';

import { 
  Request, 
  Response 
} from 'express';

import { JwtPayload } from 'jsonwebtoken';
import StatusCodes from '../../common/enums/status';

class AuthService {
  private userRepo: UserRepositry;
  private redisService: RedisServiceType;
  private tokenService: TokenServiceType;
  private CLIENT_ID: string;
  private REDIRECT_URI: string;
  private CLIENT_SECRET: string;

  constructor() {
    config();
    this.userRepo = new UserRepositry();
    this.redisService = redisService;
    this.tokenService = tokenService;
    this.CLIENT_ID = process.env.CLIENT_ID ?? "";
    this.REDIRECT_URI = process.env.REDIRECT_URI ?? "";
    this.CLIENT_SECRET = process.env.CLIENT_SECRET ?? "";
  }

  // ======================================================
  // LOGIN USER
  // ======================================================

  async login(data: Ilogin) {
    const {
      email,
      password
    } = data;

    if (
      !email ||
      !password
    ) throw new BadRequestResponse("Please fill all fields");

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
    } = this.tokenService.createCredentials(user as UserHydrated);

    return {
      accessToken,
      refreshToken
    };
  }


  // ======================================================
  // CREATE USER
  // ======================================================

  async signUp(data: ISignUp) {
    const {
      email,
      password,
      phone
    } = data;

    if (
      !email ||
      !password ||
      !phone
    ) throw new BadRequestResponse("Please fill all fields");

    const existUser: UserHydrated | null = await this.userRepo.findOne({
      filter: { email }
    });

    if (existUser) throw new BadRequestResponse("This email already existed");

    data.password = await hashValue(password);

    data.phone = encrypt(phone);

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

  // ======================================================
  // CONFIRM EMAIL
  // ======================================================

  async confirmEmail(data: ConfirmEmailType) {
    const {
      email,
      otp
    } = data;

    const user = await this.userRepo.findOne({
      filter: {
        email
      },
    });
    if (!user) throw new NotFoundResponse("User not found");

    const hasedOtp = await this.redisService.get({
      key: this.redisService.otpKey({ email })
    })
    if (!hasedOtp) throw new BadRequestResponse("Invalid or expired otp");
    if (!(await compareHash(otp, hasedOtp as string))) throw new BadRequestResponse("Invalid or expired otp");

    await this.userRepo.updateOne({
      filter: { email },
      update: { confirmEmail: true }
    });

    await this.redisService.delete({
      key: this.redisService.otpKey({ email })
    });
    await this.redisService.delete({
      key: this.redisService.otpCountKey({ email })
    });

    return;
  }

  // ======================================================
  // RESEND CONFIRM EMAIL
  // ======================================================

  async resendConfirmEmail(data: { email: string }) {
    const { email } = data;

    const user = await this.userRepo.findOne({
      filter: {
        email,
        confirmEmail: false
      }
    });
    if (!user) throw new NotFoundResponse("User not found");

    const ttl = await this.redisService.ttl({
      key: this.redisService.otpKey({ email })
    });
    if (ttl) throw new BadRequestResponse("OTP still valid");

    const otpCount = await this.redisService.get({
      key: this.redisService.otpCountKey({ email })
    })
    if (otpCount as number > 3) throw new BadRequestResponse("You reach your limit, try after 5 minutes");

    const otp = await generateOtp();
    const hashedOtp = await hashValue(otp);

    await this.redisService.set({
      key: this.redisService.otpKey({ email }),
      value: hashedOtp,
      ttl: 120
    });

    //for limit user requests
    await this.redisService.set({
      key: this.redisService.otpCountKey({ email }),
      value: 1,
      ttl: 60 * 5
    })

    emailEmitter.emit("sendEmail", async () => {
      await sendEmail({
        to: email,
        subject: "Confirm email",
        html: otpEmail({
          name: user.first_name as string,
          otp,
          title: " Resend confirm email otp",
          expiresIn: "2 minutes"
        })
      });
    })

    return;
  }

  // ======================================================
  // FORGET PASSWORD WITH OTP
  // ======================================================

  async forgotPasswordOtp(data: { email: string }) {
    const { email } = data;

    const user = await this.userRepo.findOne({
      filter: { email }
    });

    if (!user) return;

    if (user.provider === System.GMAIL) {
      throw new BadRequestResponse(
        "Google accounts cannot reset password using email password reset"
      );
    }

    const existingOtp = await this.redisService.get({
      key: this.redisService.forgetOtpKey({ email }),
    });

    if (existingOtp) {
      throw new BadRequestResponse(
        "OTP already sent. Please wait before requesting another one"
      );
    }

    const otp = await generateOtp();
    const hashedOtp = await hashValue(otp);

    await this.redisService.set({
      key: this.redisService.forgetOtpKey({ email }),
      value: hashedOtp,
      ttl: 120,
    });

    await this.redisService.set({
      key: this.redisService.forgetOtpCountKey({ email }),
      value: 1,
      ttl: 60 * 5
    })

    emailEmitter.emit("sendEmail", async () => {
      await sendEmail({
        to: email,
        subject: "Reset your password",
        html: otpEmail({
          name: user.first_name || "there",
          otp,
          title: "Forget Password otp",
          expiresIn: "2 minutes",
        }),
      });
    });

    return;
  };

  // ======================================================
  // VERIFY FORGET PASSWORD FUNCTION
  // ======================================================

  async verifyForgetPassword(data: ConfirmEmailType) {
    const { email, otp } = data;

    const user = await this.userRepo.findOne({

      filter: { email }
    });
    if (!user) throw new NotFoundResponse("User not found");

    const hasedOtp = await this.redisService.get({
      key: this.redisService.forgetOtpKey({ email })
    })
    if (!hasedOtp) throw new BadRequestResponse("Invalid or expired otp");

    const forgetOtpCount = await this.redisService.get({
      key: this.redisService.forgetOtpCountKey({ email })
    })
    if (Number(forgetOtpCount) >= 3) throw new BadRequestResponse("You reach your limit, try after 5 minutes");

    //IS VERIED?
    if (!(await compareHash(otp, hasedOtp as string))) {
      await this.redisService.incr({
        key: this.redisService.forgetOtpCountKey({ email })
      });

      throw new BadRequestResponse("Invalid or expired OTP");
    }

    return {
      verified: true,
      user
    };
  }

  // ======================================================
  // VERIFY PASSWORD WITH OTP
  // ======================================================

  async verifyForgetPasswordOtp(data: ConfirmEmailType) {
    const {
      email,
      otp
    } = data;

    const { verified } = await this.verifyForgetPassword({ email, otp });

    return verified;
  }

  // ======================================================
  // RESET PASSWORD WITH OTP
  // ======================================================

  async resetPasswordOtp(data: ConfirmEmailType & { password: string }) {
    const {
      email,
      otp,
      password,
    } = data;

    const { user } = await this.verifyForgetPassword({ email, otp });

    const hashedPassword = await hashValue(password);

    await this.userRepo.updateOne({
      filter: { email },
      update: {
        password: hashedPassword,
        changeCredentials: new Date(),
      }
    });

    await this.redisService.delete({
      key: this.redisService.forgetOtpKey({ email }),
    });

    await this.redisService.delete({
      key: this.redisService.forgetOtpCountKey({ email }),
    });

    await this.redisService.delete({
      key: this.redisService.prefixTokenKey({ userId: String(user._id) }),
    });

    emailEmitter.emit("sendEmail", async () => {
      await sendEmail({
        to: email,
        subject: "Password changed",
        html: passwordChangedEmail({
          name: user.first_name || "there",
        }),
      });
    });

    return;
  };

  // ======================================================
  // FORGET PASSWORD WITH LINK
  // ======================================================

  async forgotPasswordLink(data: { email: string }, res: Response) {
    const { email } = data;

    const user = await this.userRepo.findOne({
      filter: { email }
    });

    if (!user) {
      return successResponse({
        res,
        message: "If this email exists, a password reset link has been sent",
        status: StatusCodes.SUCCESS.OK,
      });
    }

    if (user.provider === System.GMAIL) {
      throw new BadRequestResponse(
        "Google accounts cannot reset password using email password reset"
      );
    }

    // Generate raw token
    const token = generateResetToken();

    // Hash token deterministically
    const hashedToken = hashToken(token);

    // Store hashed token in Redis
    await this.redisService.set({
      key: this.redisService.forgetTokenKey({ token: hashedToken, }),
      value: email,
      ttl: 60 * 30, // 30 minutes
    });

    // Send raw token to user
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    emailEmitter.emit("sendEmail", async () => {
      await sendEmail({
        to: email,
        subject: "Reset your password",
        html: resetPasswordEmail({
          name: user.full_name || "there",
          resetUrl,
          expiresIn: "30 minutes",
        }),
      });
    });

    return;
  };

  // ======================================================
  // RESET PASSWORD WITH LINK
  // ======================================================

  async resetPasswordLink(data: { token: string, password: string }) {
    const {
      token,
      password
    } = data;

    if (
      !token ||
      !password
    ) {
      throw new BadRequestResponse("Token and password are required");
    }

    const hashedToken = hashToken(token);

    // Find token in Redis
    const email = await this.redisService.get({
      key: this.redisService.forgetTokenKey({ token: hashedToken }),
    });

    // Token doesn't exist or expired
    if (!email) throw new BadRequestResponse("Invalid or expired reset link");

    const user = await this.userRepo.findOne({
      filter: { email, }
    });

    if (!user) throw new BadRequestResponse("Invalid or expired reset link");

    const hashedPassword = await hashValue(password);

    await this.userRepo.updateOne({

      filter: { email },
      update: {
        password: hashedPassword,
        changeCredentials: new Date(),
      }
    });

    // Delete used reset token
    await this.redisService.delete({
      key: this.redisService.forgetTokenKey({ token: hashedToken }),
    });

    // Invalidate existing login tokens
    await this.redisService.delete({
      key: this.redisService.prefixTokenKey({ userId: String(user._id) }),
    });

    emailEmitter.emit("sendEmail", async () => {
      await sendEmail({
        to: email as string,
        subject: "Password changed",
        html: passwordChangedEmail({
          name: user.first_name || "there",
        }),
      });
    });

    return;
  };

  // ======================================================
  // UPDATE PASSWORD
  // ======================================================

  async updatePassword(data: PasswordType, user: UserHydrated) {
    const {
      oldPassword,
      newPassword,
      confirmPassword
    } = data;
    const { id, password } = user;
    const oldPasswords = user.oldPasswords ?? [];

    if (!(await compareHash(oldPassword, password as string))) {
      throw new BadRequestResponse("Invalid old password");
    }
    if (
      !oldPassword ||
      !newPassword ||
      !confirmPassword
    ) throw new BadRequestResponse("Please fill all fields.");

    if (newPassword !== confirmPassword) {
      throw new BadRequestResponse("Invalid confirm password");
    }

    for (let i = 0; i < oldPasswords.length; i++) {
      if (await compareHash(newPassword, oldPasswords[i] as string)) {
        throw new BadRequestResponse("This password are used before, please write new password");
      }
    }

    oldPasswords.push(await hashValue(oldPassword));
    user.oldPasswords = oldPasswords;
    user.password = await hashValue(newPassword);
    user.changeCredentials = new Date();

    await user.save();

    return user;
  }

  // ======================================================
  // Simulate frontend redirect to Google OAuth2.0 login page
  // ======================================================

  async simulateFrontendGoogle() {
    const url =
      "https://accounts.google.com/o/oauth2/v2/auth" +
      `?client_id=${this.CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}` +
      "&response_type=code" +
      "&scope=openid%20email%20profile" +
      "&access_type=offline" +
      "&prompt=consent";
    return url;
  };

  // ======================================================
  // LOGIN WITH GOOGLE
  // ======================================================

  async loginGoogle(data: { code: number }) {
    const { code } = data;
    if (!code) throw new BadRequestResponse("Code is required");

    const resToken = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        redirect_uri: this.REDIRECT_URI,
        grant_type: "authorization_code",
        code,
      }
    );

    const { access_token, id_token } = resToken.data;
    const client = new OAuth2Client(this.CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: this.CLIENT_ID,
    });

    const payload = await ticket.getPayload();
    let accessToken, refreshToken;
    if (payload && payload.email_verified) {
      let user = await this.userRepo.findOne({
        filter: { email: payload.email ?? "" }
      });
      if (!user) {
        user = await this.userRepo.create({
          data: {
            first_name: payload.given_name ?? "",
            last_name: payload.family_name ?? "",
            email: payload.email ?? "",
            provider: System.GMAIL,
          }
        });
      }

      ({ accessToken, refreshToken } = this.tokenService.createCredentials(user));

    } else {
      throw new UnauthorizedResponse("Email not verified by Google");
    }

    return { accessToken, refreshToken }
  };

  // ======================================================
  // REFRESH TOKEN
  // ======================================================

  async refreshToken(data: Request & JwtPayload) {
    const userId = data.user.id;
    const refreshToken = data.headers["refresh-token"];
    if (!refreshToken) throw new BadRequestResponse("Refresh token is required");

    let createTokenTime = data.decoded.iat
    let uniqueTokenSigniture = data.decoded.jti;
    const expireAccessTime = 60;
    const expireTime = (createTokenTime + 60 * expireAccessTime) * 1000;


    const decoded = await this.tokenService.verifyToken(refreshToken as string, tokenTypes.REFRESH)
    if (!decoded) {
      throw new UnauthorizedResponse(
        "Invalid Refresh Token"
      );
    }

    const user = await this.userRepo.findOne({

      filter: { _id: decoded.payload.id }
    })
    if (!user) throw new NotFoundResponse("User not found");

    await this.redisService.setToken({
      userId,
      tokenSigniture: uniqueTokenSigniture,
      value: uniqueTokenSigniture,
      ttl: expireTime
    })

    const { accessToken } = this.tokenService.createCredentials(user);

    return accessToken;
  }

  // ======================================================
  // LOGOUT USER
  // ======================================================

  async logoutUser(data: Request & JwtPayload) {
    const userId = data.user.id;
    const flag = data.body.flag;

    let createTokenTime = data.decoded.iat
    let uniqueTokenSigniture = data.decoded.jti;
    const expireAccessTime = 60;
    const expireTime = (createTokenTime + 60 * expireAccessTime) * 1000;

    //60 minutes
    let user = null;

    if (flag === "All") {
      await this.userRepo.updateOne({
        filter: { _id: userId },
        update: {
          $set: {
            changeCredentials: new Date()
          }
        }
      })

      user = await this.userRepo.findOne({
        filter: { _id: userId }
      })

      await this.redisService.deleteAllTokens({
        userId
      })

      if (!user) throw new NotFoundResponse("User not found");

    } else {

      await this.redisService.setToken({
        userId,
        tokenSigniture: uniqueTokenSigniture,
        value: uniqueTokenSigniture,
        ttl: expireTime
      })
    }

    return user;
  }
}

const authService = new AuthService();

export default authService;