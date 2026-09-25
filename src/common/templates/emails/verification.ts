import layout from "./layout.js";

export const verificationEmail = ({
  name = "there",
  verificationUrl,
}:{
  name:string,
  verificationUrl:string
}) => {
  return layout({
    title: "Verify your email",
    content: `
      <p style="margin:0 0 8px;font-size:15px;color:#6b7280;">
        Hi ${name},
      </p>

      <h1 style="
        margin:0 0 16px;
        font-size:24px;
      ">
        Verify your email
      </h1>

      <p style="
        margin:0 0 24px;
        color:#4b5563;
        line-height:1.6;
        font-size:15px;
      ">
        Please verify your email address to complete your account setup.
      </p>

      <a
        href="${verificationUrl}"
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
        Verify Email
      </a>

      <p style="
        margin:24px 0 0;
        color:#9ca3af;
        font-size:13px;
        line-height:1.5;
      ">
        If you didn't create an account, you can safely ignore this email.
      </p>
    `,
  });
};

