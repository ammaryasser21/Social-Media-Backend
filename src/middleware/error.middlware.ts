import { MulterError } from 'multer';
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import StatusCodes from "../common/enums/status.js";
interface IError extends Error{
    statusCode:number;
}
export const globalErrorHandler:ErrorRequestHandler = (
    err:IError, 
    req:Request, 
    res:Response, 
    next:NextFunction
) => {
  let statusCode = err?.statusCode ?? StatusCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR;
  const message = err?.message ?? 'Internal server error';

  if (err instanceof MulterError) {
    statusCode = StatusCodes.CLIENT_ERROR.BAD_REQUEST;
  }

  res.status(statusCode).json({
    success: false, 
    status: statusCode,
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    cause:err?.cause
  });
};
