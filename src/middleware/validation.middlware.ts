import { NextFunction, Request, Response } from "express"
import { BadRequestResponse } from "../common/response";
import { keyof, ZodError, ZodType } from "zod";

type keyRequestType = keyof Request;//"body"|"params"|....
export type schemaType = Partial<Record<keyRequestType, ZodType>>;
type IssueType = {
    path: (string | number|symbol)[];
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