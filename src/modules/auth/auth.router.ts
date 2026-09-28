import { Router } from "express";
import { confirmEmail, forgotPasswordLink, forgotPasswordOtp, login, loginGoogle, logoutUser, refreshToken, resendConfirmEmail, resetPasswordLink, resetPasswordOtp, signUp, simulateFrontendGoogle, updatePassword, verifyForgetPasswordOtp } from "./auth.controller";
import { validation } from "../../middleware/";
import { confirmSchema, forgotPasswordSchema, googleLoginSchema, loginSchema, resendConfirmSchema, resetPasswordLinkSchema, resetPasswordOtpSchema, signUpSchema, updatePasswordSchema, verifyForgotPasswordSchema } from "./auth.validation";
import { auth, authorize } from "../../middleware/auth.middlware";
import { Roles } from "../../common/enums/roles";

const authRouter = Router();

/*
xRouter.<method>("Endpoint",
    Rate Limiting,
    Authentication,
    Validation,
    Authorization, 
    Controller
);
*/

authRouter.post(
    "/signup",
    validation(signUpSchema),
    signUp
)

authRouter.post(
    "/login",
    validation(loginSchema),
    login
);


authRouter.post("/refresh",
  auth,
  refreshToken
);

authRouter.patch("/confirm-email",
validation(confirmSchema),
  confirmEmail
);

authRouter.patch("/resend-confirm-email",
validation(resendConfirmSchema),
  resendConfirmEmail
);

authRouter.post("/forgot-password/otp",
validation(forgotPasswordSchema),
  forgotPasswordOtp
);

authRouter.post("/verify-forgot-password/otp",
validation(verifyForgotPasswordSchema),
  verifyForgetPasswordOtp
);

authRouter.post("/reset-password/otp",
validation(resetPasswordOtpSchema),
  resetPasswordOtp
);

authRouter.post("/forgot-password/link",
validation(forgotPasswordSchema),
  forgotPasswordLink
);

authRouter.post("/reset-password/link",
validation(resetPasswordLinkSchema),
  resetPasswordLink
);

authRouter.patch("/update-password",
  auth,
  authorize(Roles.USER),
validation(updatePasswordSchema),
  updatePassword
);

//Simulate frontend redirect to Google OAuth2.0 login page
authRouter.get("/google",
  simulateFrontendGoogle
);

authRouter.get("/google/callback",
validation(googleLoginSchema),
  loginGoogle
);

authRouter.patch("/logout",
  auth,
  logoutUser
);

export default authRouter;