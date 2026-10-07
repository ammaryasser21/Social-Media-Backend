import { Attachment } from "nodemailer";


export type SendEmailParams = {
    to: string;
    subject: string;
    cc?: string;
    bcc?: string;
    html: string;
    text?: string;
    attachments?: Attachment[];
};

export type OtpTemplateType = {
    name?: string | undefined,
    otp: string,
    title: string,
    expiresIn?: string,
}

export type EmailLayoutType = {
    title: string,
    content: string,
    appName?: string
}

export type LoginAlertType = {
    name: string,
    device: string,
    location: string,
    date: string,
}

export type NotificationTemplateType = {
    name: string,
    title: string,
    message: string,
    buttonText: string,
    buttonUrl: string,
}