import { NextFunction, Request, Response } from "express"
import { BadRequestResponse, ErrorResponse } from "../common/response";
import {
    ZodError,
    ZodType
} from "zod";
import { GraphQLError } from "graphql";
import { SocketErrorResponse } from "../common/response/error-response";

type keyRequestType = keyof Request;
export type schemaType = Partial<Record<keyRequestType, ZodType>>;
type IssueType = {
    path: (string | number | symbol)[];
    message: string;
};

type IssuesType = {
    key: keyRequestType;
    issues: IssueType[];
};

export const validation = (schema: schemaType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const issues: IssuesType[] = [];

        for (const key of Object.keys(schema) as keyRequestType[]) {
            if (!schema[key]) continue;

            const result = schema[key]?.safeParse(req[key]);
            const errors = result.error as ZodError;
            if (!result?.success) {
                issues.push({
                    key,
                    issues: errors.issues.map((err) => {
                        return {
                            path: err.path,
                            message: err.message,
                        };
                    })
                })
            }

        }

        if (issues.length) {
            throw new BadRequestResponse("validation error", {
                issues,
            })
        }

        next();
    }
}

export const GQLValidation = <T>(schema: ZodType, args: T) => {

    const result = schema?.safeParse(args);
    const errors = result.error as ZodError;
    if (!result?.success) {
        throw new GraphQLError("validation error", {
            extensions: {
                cause: errors.issues.map((err) => {
                    return {
                        path: err.path,
                        message: err.message
                    }
                })
            }
        })
    }

}

export const SocketValidation = <T>(schema: ZodType, data: T) => {

    const result = schema?.safeParse(data);
    const errors = result.error as ZodError;
    if (!result?.success) {
        throw new SocketErrorResponse(
        "Validation error",
        400,
        result.error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
        }))
    );
    }

}

