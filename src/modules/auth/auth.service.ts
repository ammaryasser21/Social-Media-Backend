import {
  redisService,
  RedisServiceType
} from '../../common/services/redis.service';

import {
  BadRequestResponse,
  NotFoundResponse,
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
import { UserRepository } from '../../db/repo/user.repository';

import {
  IgoogleLogin,
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
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import { tokenTypes } from '../../common/enums/token';
import { resetPasswordEmail } from '../../common/templates/emails/reset-password';
import { JwtPayload } from 'jsonwebtoken';
import notificationService, { NotificationServiceType } from '../../common/services/notification.service';


class AuthService {
  private userRepo: UserRepository;
  private redisService: RedisServiceType;
  private tokenService: TokenServiceType;
  private CLIENT_ID: string;
  private REDIRECT_URI: string;
  private CLIENT_SECRET: string;
  private notificationService: NotificationServiceType;

  constructor() {
    this.userRepo = new UserRepository();
    this.redisService = redisService;
    this.tokenService = tokenService;
    this.CLIENT_ID = process.env.CLIENT_ID ?? "";
    this.REDIRECT_URI = process.env.REDIRECT_URI ?? "";
    this.CLIENT_SECRET = process.env.CLIENT_SECRET ?? "";
    this.notificationService = notificationService;
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
      projection: {
        password: 1,
        email: 1,
        role: 1,
        confirmEmail: 1,
        is_active: 1,
      },
      options: {
        lean: false,
      },
    });
    if (!user) throw new BadRequestResponse("Invalid email or password");

    if (!user.confirmEmail) {
      throw new UnauthorizedResponse(
        "Please confirm your email first"
      );
    }


    if (!await compareHash(password, user.password as string)) {
      throw new BadRequestResponse("Invalid email or password");
    }


    if (data.FCM_Token) {
      await this.redisService.setFCMToken(
        String(user._id),
        data.FCM_Token
      );

      const tokens = await this.redisService.getFCMToken(
        String(user._id)
      );

      await Promise.allSettled(
        tokens.map((token) =>
          this.notificationService.sendNotification({
            token,
            title: "Login successfully",
            data: ""
          })
        )
      );
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
      phone,
    } = data;

    const existUser = await this.userRepo.findOne({
      filter: { email },
    });

    if (existUser) {
      throw new BadRequestResponse(
        "This email already exists"
      );
    }

    data.password = await hashValue(password);
    data.phone = encrypt(phone);

    const user = await this.userRepo.create({
      data,
    });

    const otp = await generateOtp();
    const hashedOtp = await hashValue(otp);

    await this.redisService.set({
      key: this.redisService.otpKey({ email }),
      value: hashedOtp,
      ttl: 120,
    });

    await this.redisService.set({
      key: this.redisService.otpCountKey({ email }),
      value: 1,
      ttl: 60 * 5,
    });

    emailEmitter.emit("sendEmail", () => {
      void sendEmail({
        to: email,
        subject: "Confirm email",
        html: otpEmail({
          name: user.first_name,
          otp,
          title: "Confirm email otp",
          expiresIn: "2 minutes",
        }),
      }).catch(console.error);
    });

    return { user };
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
        confirmEmail: false,
      },
    });

    if (!user) {
      throw new NotFoundResponse("User not found");
    }

    // Prevent requesting another OTP while the current one is still valid
    const otpKey = this.redisService.otpKey({ email });

    const ttl = await this.redisService.ttl({
      key: otpKey,
    });

    if (ttl > 0) {
      throw new BadRequestResponse(
        "OTP still valid. Please wait before requesting another one"
      );
    }

    const otpCountKey = this.redisService.otpCountKey({ email });

    // Maximum 3 OTP requests within 5 minutes
    const otpCount = Number(
      await this.redisService.get({
        key: otpCountKey,
      }) ?? 0
    );

    if (otpCount >= 3) {
      throw new BadRequestResponse(
        "You reached your limit, try again after 5 minutes"
      );
    }

    // Increment request count first
    const newCount = await this.redisService.incrWithExpire({
      key: otpCountKey,
      ttl: 60 * 5,
    });

    // Safety check in case of concurrent requests
    if (newCount > 3) {
      await this.redisService.decr({
        key: otpCountKey,
      });

      throw new BadRequestResponse(
        "You reached your limit, try again after 5 minutes"
      );
    }

    // Generate OTP only after the request has been accepted
    const otp = await generateOtp();
    const hashedOtp = await hashValue(otp);

    await this.redisService.set({
      key: otpKey,
      value: hashedOtp,
      ttl: 120,
    });

    emailEmitter.emit("sendEmail", async () => {
      await sendEmail({
        to: email,
        subject: "Confirm email",
        html: otpEmail({
          name: user.first_name as string,
          otp,
          title: "Resend confirm email OTP",
          expiresIn: "2 minutes",
        }),
      });
    });

    return;
  }

  // ======================================================
  // FORGET PASSWORD WITH OTP
  // ======================================================

  async forgotPasswordOtp(data: { email: string }) {
    const { email } = data;

    const user = await this.userRepo.findOne({
      filter: { email },
    });

    // Do not reveal whether the email exists.
    if (!user) {
      return;
    }

    if (user.provider === System.GMAIL) {
      throw new BadRequestResponse(
        "Google accounts cannot reset password using email password reset"
      );
    }

    const otpKey = this.redisService.forgetOtpKey({ email });

    // Prevent requesting another OTP while the current one is still valid
    const existingOtp = await this.redisService.get({
      key: otpKey,
    });

    if (existingOtp) {
      throw new BadRequestResponse(
        "OTP already sent. Please wait before requesting another one"
      );
    }

    // ======================================================
    // OTP REQUEST LIMIT
    // Maximum 3 OTP requests within 5 minutes
    // ======================================================

    const requestCountKey =
      this.redisService.forgetOtpRequestCountKey({ email });

    const requestCount = Number(
      await this.redisService.get({
        key: requestCountKey,
      }) ?? 0
    );

    if (requestCount >= 3) {
      throw new BadRequestResponse(
        "You reached your limit, try again after 5 minutes"
      );
    }

    // Increment request count BEFORE generating/storing OTP
    const newRequestCount =
      await this.redisService.incrWithExpire({
        key: requestCountKey,
        ttl: 60 * 5,
      });

    // Safety check for concurrent requests
    if (newRequestCount > 3) {
      await this.redisService.decr({
        key: requestCountKey,
      });

      throw new BadRequestResponse(
        "You reached your limit, try again after 5 minutes"
      );
    }

    // ======================================================
    // GENERATE OTP
    // ======================================================

    const otp = await generateOtp();
    const hashedOtp = await hashValue(otp);

    await this.redisService.set({
      key: otpKey,
      value: hashedOtp,
      ttl: 120,
    });

    // ======================================================
    // RESET FAILED ATTEMPTS FOR THIS OTP
    // ======================================================

    const attemptCountKey =
      this.redisService.forgetOtpAttemptCountKey({ email });

    await this.redisService.delete({
      key: attemptCountKey,
    });

    // ======================================================
    // SEND EMAIL
    // ======================================================

    emailEmitter.emit("sendEmail", async () => {
      await sendEmail({
        to: email,
        subject: "Reset your password",
        html: otpEmail({
          name: user.first_name || "there",
          otp,
          title: "Forget Password OTP",
          expiresIn: "2 minutes",
        }),
      });
    });

    return;
  }

  // ======================================================
  // VERIFY FORGET PASSWORD FUNCTION
  // ======================================================

  async verifyForgetPassword(data: ConfirmEmailType) {
    const { email, otp } = data;

    const user = await this.userRepo.findOne({
      filter: { email },
    });

    if (!user) {
      throw new NotFoundResponse("User not found");
    }

    const otpKey = this.redisService.forgetOtpKey({ email });

    const hashedOtp = await this.redisService.get({
      key: otpKey,
    });

    if (!hashedOtp) {
      throw new BadRequestResponse(
        "Invalid or expired OTP"
      );
    }

    // ======================================================
    // CHECK FAILED ATTEMPTS
    // Maximum 5 incorrect attempts
    // ======================================================

    const attemptCountKey =
      this.redisService.forgetOtpAttemptCountKey({ email });

    const attemptCount = Number(
      await this.redisService.get({
        key: attemptCountKey,
      }) ?? 0
    );

    if (attemptCount >= 5) {
      throw new BadRequestResponse(
        "Too many incorrect attempts. Please request a new OTP"
      );
    }

    // ======================================================
    // VERIFY OTP
    // ======================================================

    const isValid = await compareHash(
      otp,
      hashedOtp as string
    );

    if (!isValid) {
      const newAttemptCount =
        await this.redisService.incrWithExpire({
          key: attemptCountKey,
          ttl: 120,
        });

      if (newAttemptCount >= 5) {
        throw new BadRequestResponse(
          "Too many incorrect attempts. Please request a new OTP"
        );
      }

      throw new BadRequestResponse(
        "Invalid or expired OTP"
      );
    }

    // ======================================================
    // OTP IS VALID
    // ======================================================

    return {
      verified: true,
      user,
    };
  }

  // ======================================================
  // VERIFY PASSWORD WITH OTP
  // ======================================================

  async verifyForgetPasswordOtp(data: ConfirmEmailType) {
    const { verified } = await this.verifyForgetPassword(data);

    return verified;
  }

  // ======================================================
  // RESET PASSWORD WITH OTP
  // ======================================================

  async resetPasswordOtp(
    data: ConfirmEmailType & { password: string }
  ) {
    const {
      email,
      otp,
      password,
    } = data;

    const { user } = await this.verifyForgetPassword({
      email,
      otp,
    });

    const hashedPassword = await hashValue(password);

    await this.userRepo.updateOne({
      filter: { email },
      update: {
        password: hashedPassword,
        changeCredentials: new Date(),
      },
    });

    // Delete OTP
    await this.redisService.delete({
      key: this.redisService.forgetOtpKey({ email }),
    });

    // Delete failed-attempt counter
    await this.redisService.delete({
      key: this.redisService.forgetOtpAttemptCountKey({
        email,
      }),
    });

    // Invalidate existing sessions/tokens
    await this.redisService.deleteAllTokens({
      userId: String(user._id),
    });

    await emailEmitter.emit("sendEmail", async () => {
      await sendEmail({
        to: email,
        subject: "Password changed",
        html: passwordChangedEmail({
          name: user.first_name || "there",
        }),
      });
    });

    return;
  }

  // ======================================================
  // FORGET PASSWORD WITH LINK
  // ======================================================

  async forgotPasswordLink(data: { email: string }) {
    const { email } = data;

    const user = await this.userRepo.findOne({
      filter: { email }
    });

    if (!user) {
      return;
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
      confirmPassword,
    } = data;

    if (!oldPassword || !newPassword || !confirmPassword) {
      throw new BadRequestResponse(
        "Please fill all fields."
      );
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestResponse(
        "Invalid confirm password"
      );
    }

    const currentUser = await this.userRepo.findOne({
      filter: { _id: user._id },
      projection: {
        password: 1,
        oldPasswords: 1,
      },
    });

    if (!currentUser?.password) {
      throw new BadRequestResponse(
        "Current password is unavailable"
      );
    }

    if (!(await compareHash(
      oldPassword,
      currentUser.password
    ))) {
      throw new BadRequestResponse(
        "Invalid old password"
      );
    }

    const oldPasswords = currentUser.oldPasswords ?? [];

    for (const oldPasswordHash of oldPasswords) {
      if (await compareHash(
        newPassword,
        oldPasswordHash
      )) {
        throw new BadRequestResponse(
          "This password was used before, please choose a new password"
        );
      }
    }

    oldPasswords.push(currentUser.password);

    const newPasswordHash = await hashValue(newPassword);

    await this.userRepo.updateOne({
      filter: { _id: user._id },
      update: {
        password: newPasswordHash,
        oldPasswords,
        changeCredentials: new Date(),
      },
    });

    return;
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

  async loginGoogle(data: IgoogleLogin) {
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

    const { id_token } = resToken.data;
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
            confirmEmail: true,
            is_active: true,
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

  async refreshToken(token: string) {
    const decoded = await this.tokenService.decodeToken(
      token,
      tokenTypes.REFRESH
    );

    const user = await this.userRepo.findOne({
      filter: {
        _id: decoded.id,
      },
    });

    if (!user) {
      throw new NotFoundResponse("User not found");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      this.tokenService.createCredentials(user);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  // ======================================================
  // LOGOUT USER
  // ======================================================

  async logoutUser(
    user: UserHydrated,
    payload: JwtPayload,
    flag: string
  ) {


    const userId = String(user._id);
    const jti = payload.jti;
    const exp = payload.exp;

    if (!jti) {
      throw new BadRequestResponse(
        "Invalid access token"
      );
    }

    if (flag === "All") {
      await this.userRepo.updateOne({
        filter: { _id: userId },
        update: {
          $set: {
            changeCredentials: new Date(),
          },
        },
      });

      await this.redisService.deleteAllTokens({
        userId,
      });

      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const remainingSeconds = exp
      ? Math.max(exp - now, 1)
      : 3600;

    await this.redisService.setToken({
      userId,
      tokenSigniture: jti,
      value: jti,
      ttl: remainingSeconds,
    });

    return null;
  }
}

const authService = new AuthService();

export default authService;