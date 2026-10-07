import StatusCodes from "../enums/status.js";

abstract class ApplicationException extends Error {
    public statusCode: number;

    constructor(
        message: string,
        statusCode: number,
        cause?: unknown
    ) {
        super(message, { cause });
        this.statusCode = statusCode;
    }
}

export class ErrorResponse extends ApplicationException {
    constructor(message: string, statusCode: number, cause?: unknown) {
        super(
            message,
            statusCode,
            cause
        );
    }
}

export class NotFoundResponse extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(
            message,
            StatusCodes.CLIENT_ERROR.NOT_FOUND,
            cause
        );
    }
}

export class BadRequestResponse extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(
            message,
            StatusCodes.CLIENT_ERROR.BAD_REQUEST,
            cause
        );
    }
}

export class UnauthorizedResponse extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(
            message,
            StatusCodes.CLIENT_ERROR.UNAUTHORIZED,
            cause
        );
    }
}

export class ForbiddenResponse extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(
            message,
            StatusCodes.CLIENT_ERROR.FORBIDDEN,
            cause
        );
    }
}
