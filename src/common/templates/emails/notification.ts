import { NotificationTemplateType } from "../../interfaces/email.interface.js";
import layout from "./layout.js";

export const notificationEmail = ({
  name = "there",
  title,
  message,
  buttonText,
  buttonUrl,
}: NotificationTemplateType) => {
  return layout({
    title,
    content: `
      <p style="margin:0 0 8px;color:#6b7280;font-size:15px;">
        Hi ${name},
      </p>

      <h1 style="
        margin:0 0 16px;
        font-size:24px;
      ">
        ${title}
      </h1>

      <p style="
        margin:0 0 24px;
        color:#4b5563;
        font-size:15px;
        line-height:1.7;
      ">
        ${message}
      </p>

      ${buttonText && buttonUrl
        ? `
            <a
              href="${buttonUrl}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#111827;
                color:#ffffff;
                text-decoration:none;
                border-radius:6px;
                font-size:14px;
                font-weight:bold;
              "
            >
              ${buttonText}
            </a>
          `
        : ""
      }
    `,
  });
};