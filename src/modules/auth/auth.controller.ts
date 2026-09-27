import { email } from 'zod';
import {
  NextFunction,
  Request,
  Response,
} from "express";

import StatusCodes from "../../common/enums/status";
import { ErrorResponse, successResponse } from "../../common/response";

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
      message: "Login Success",
      status: StatusCodes.SUCCESS.OK,
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
        message: "SignUp Success",
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
        message: "",
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
        message: "",
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
        message: "",
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
      message: "",
      status: StatusCodes.SUCCESS.OK,
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
    
      await authService.verifyForgetPasswordOtp(req.body);
    
      return successResponse({
        res,
        message: "",
        status: StatusCodes.SUCCESS.OK
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
        message: "",
        status: StatusCodes.SUCCESS.OK
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
    
      await authService.forgotPasswordLink(req.body);
    
      return successResponse({
        res,
        message: "",
        status: StatusCodes.SUCCESS.OK,
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
        message: "",
        status: StatusCodes.SUCCESS.OK,
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
    
      const result = await authService.updatePassword(req.body,req.user);
    
      return successResponse({
        res,
        message: "",
        status: StatusCodes.SUCCESS.OK,
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

  return successResponse({
    res,
    message: "",
    status: StatusCodes.SUCCESS.CREATED,
    data: result,
  });
};
export const loginGoogle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await authService.loginGoogle(req.body);

  return successResponse({
    res,
    message: "",
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
    message: "",
    status: StatusCodes.SUCCESS.OK,
    data: result,
  });
};