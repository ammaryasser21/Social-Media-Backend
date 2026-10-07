import { OtpTemplateType } from "../../interfaces/email.interface.js";
import layout from "./layout";

export const otpEmail = ({
  name = "there",
  otp,
  title,
  expiresIn = "10 minutes",
}: OtpTemplateType) => {
  return layout({
    title: `${title}`,
    content: `
      <p style="margin:0 0 8px;color:#6b7280;font-size:15px;">
        Hi ${name},
      </p>

      <h1 style="
        margin:0 0 16px;
        font-size:24px;
      ">
        Your verification code
      </h1>

      <p style="
        margin:0 0 20px;
        color:#4b5563;
        font-size:15px;
      ">
        Use the following code to continue:
      </p>

      <div style="
        padding:18px;
        background:#f3f4f6;
        border-radius:8px;
        text-align:center;
        letter-spacing:8px;
        font-size:28px;
        font-weight:bold;
        color:#111827;
      ">
        ${otp}
      </div>

      <p style="
        margin:20px 0 0;
        color:#9ca3af;
        font-size:13px;
      ">
        This code will expire in ${expiresIn}.
      </p>

      <p style="
        margin:10px 0 0;
        color:#9ca3af;
        font-size:13px;
      ">
        Never share this code with anyone.
      </p>
    `,
  });
};