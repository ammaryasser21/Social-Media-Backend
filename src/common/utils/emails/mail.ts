import nodemailer from "nodemailer";
import { SendEmailParams } from "../../interfaces/email.interface";

export const sendEmail = async ({
    to = "",
    subject = "",
    cc = "",
    bcc = "",
    html = "",
    text = "",
    attachments = []
}: SendEmailParams) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.verify();

    console.log("SMTP connection is ready");

    try {
        const info = await transporter.sendMail({
            from: `"${process.env.MY_APP} App" <${process.env.EMAIL_USER}>`,
            to,
            cc,
            bcc,
            subject,
            text,
            html,
            attachments
        });

        console.log("Email sent:", info.messageId);

        return info;
    } catch (error) {
        console.error("Email sending error:", error);
        throw error;
    }
};

