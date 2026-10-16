import StatusCodes from "../enums/status";
import { SocketErrorResponse } from "../response/error-response";


export const mapSocketError = (error: unknown) => {
    if (error instanceof SocketErrorResponse) {
        return {
            success: false,
            error: {
                code: error.code,
                statusCode: error.statusCode,
                message: error.message,
                details: error.details,
            },
        };
    }

    return {
        success: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            statusCode: StatusCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR,
            message: "Internal Server Error",
        },
    };
};