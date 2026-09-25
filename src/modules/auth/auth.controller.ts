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
  const result = await authService.login(req.body);

  return successResponse({
    res,
    message: "Login Success",
    status: StatusCodes.SUCCESS.OK,
    data: result,
  });
};

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await authService.signUp(req.body);

  return successResponse({
    res,
    message: "SignUp Success",
    status: StatusCodes.SUCCESS.CREATED,
    data: result,
  });
};