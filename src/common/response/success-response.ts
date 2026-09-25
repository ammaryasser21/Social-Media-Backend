import { Response } from "express";
import StatusCodes from "../enums/status.js";

interface SuccessResponseOptions<T> {
  res: Response;
  message?: string;
  status?: number;
  data?: T;
}

export const successResponse = <T>({
  res,
  message,
  status = StatusCodes.SUCCESS.OK,
  data,
}: SuccessResponseOptions<T>) => {
  return res.status(status).json({
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  });
};
