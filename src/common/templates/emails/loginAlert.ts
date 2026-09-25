import { LoginAlertType } from "../../interfaces/email.interface.js";
import layout from "./layout.js";

export const loginAlertEmail = ({
  name = "there",
  device = "Unknown device",
  location = "Unknown location",
  date = new Date().toUTCString(),
}:LoginAlertType) => {
  return layout({
    title: "New login detected",
    content: `
      <p style="margin:0 0 8px;color:#6b7280;font-size:15px;">
        Hi ${name},
      </p>

      <h1 style="
        margin:0 0 16px;
        font-size:24px;
      ">
        New login detected
      </h1>

      <p style="
        margin:0 0 20px;
        color:#4b5563;
        font-size:15px;
        line-height:1.6;
      ">
        A new login was detected on your account.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:14px;">
            Device
          </td>
          <td style="padding:8px 0;text-align:right;font-size:14px;">
            ${device}
          </td>
        </tr>

        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:14px;">
            Location
          </td>
          <td style="padding:8px 0;text-align:right;font-size:14px;">
            ${location}
          </td>
        </tr>

        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:14px;">
            Time
          </td>
          <td style="padding:8px 0;text-align:right;font-size:14px;">
            ${date}
          </td>
        </tr>
      </table>

      <p style="
        margin:24px 0 0;
        color:#9ca3af;
        font-size:13px;
      ">
        If this wasn't you, please secure your account immediately.
      </p>
    `,
  });
};