import {
  NextFunction,
  Request,
  Response,
} from "express";

import StatusCodes from "../../common/enums/status";
import { successResponse } from "../../common/response";

import authService from "./auth.service";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const result = await authService.login(req.body);

    return successResponse({
      res,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.signUp(req.body);

    return successResponse({
      res,
      message: "User added successfully",
      status: StatusCodes.SUCCESS.CREATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.refreshToken(req);

    return successResponse({
      res,
      message: "Access Token created",
      status: StatusCodes.SUCCESS.CREATED,
      data: result,
    });

  } catch (error) {
    next(error);
  }
};

export const confirmEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {
    await authService.confirmEmail({
      email: req.body.email,
      otp: req.body.otp
    });

    return successResponse({
      res,
      message: "Email confirmed successfully",
      status: StatusCodes.SUCCESS.OK
    });
  } catch (error) {
    next(error);
  }
};

export const resendConfirmEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await authService.resendConfirmEmail(req.body);

    return successResponse({
      res,
      message: "Otp sent again",
      status: StatusCodes.SUCCESS.OK
    });

  } catch (error) {
    next(error);
  }
};

export const forgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await authService.forgotPasswordOtp(req.body)

    return successResponse({
      res,
      message: "If this email exists, a reset OTP has been sent",
    });
  } catch (error) {
    next(error);
  }

};

export const verifyForgetPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const verified = await authService.verifyForgetPasswordOtp(req.body);

    return successResponse({
      res,
      message: verified ?
        "OTP is verified" : "OTP is not verified",
      status: verified ?
        StatusCodes.SUCCESS.OK : StatusCodes.SERVER_ERROR.SERVICE_UNAVAILABLE,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    await authService.resetPasswordOtp(req.body);

    return successResponse({
      res,
      message: "Password reset successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    await authService.forgotPasswordLink(req.body, res);

    return successResponse({
      res,
      message: "If this email exists, a password reset link has been sent",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    await authService.resetPasswordLink(req.body);

    return successResponse({
      res,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const result = await authService.updatePassword(req.body, req.user);

    return successResponse({
      res,
      message: "Password updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const simulateFrontendGoogle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await authService.simulateFrontendGoogle();

  res.redirect(result);
};

export const loginGoogle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await authService.loginGoogle(req.body);

  return successResponse({
    res,
    message: "User logged in successfully with Google",
    status: StatusCodes.SUCCESS.CREATED,
    data: result,
  });
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await authService.logoutUser(req.body);

  return successResponse({
    res,
    message: "User logout successfully",
    data: result,
  });
};