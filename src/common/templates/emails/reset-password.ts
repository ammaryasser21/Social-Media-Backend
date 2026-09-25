import layout from "./layout.js";

export const resetPasswordEmail = ({
  name = "there",
  resetUrl,
  expiresIn = "30 minutes",
}:{
  name:string,
  resetUrl:string,
  expiresIn:string
}) => {
  return layout({
    title: "Reset your password",
    content: `
      <p style="margin:0 0 8px;color:#6b7280;font-size:15px;">
        Hi ${name},
      </p>

      <h1 style="
        margin:0 0 16px;
        font-size:24px;
      ">
        Reset your password
      </h1>

      <p style="
        margin:0 0 24px;
        color:#4b5563;
        line-height:1.6;
        font-size:15px;
      ">
        We received a request to reset your password.
        Click the button below to choose a new password.
      </p>

      <a
        href="${resetUrl}"
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
        Reset Password
      </a>

      <p style="
        margin:24px 0 0;
        color:#9ca3af;
        font-size:13px;
        line-height:1.5;
      ">
        This link expires in ${expiresIn}.
      </p>

      <p style="
        margin:8px 0 0;
        color:#9ca3af;
        font-size:13px;
      ">
        If you didn't request this, you can safely ignore this email.
      </p>
    `,
  });
};
