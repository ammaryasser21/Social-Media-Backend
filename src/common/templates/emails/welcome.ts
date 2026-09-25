import layout from "./layout.js";

export const welcomeEmail = ({
  name = "there",
  dashboardUrl,
}:{
  name:string,
  dashboardUrl:string
}) => {
  return layout({
    title: "Welcome",
    content: `
      <p style="margin:0 0 8px;color:#6b7280;font-size:15px;">
        Hi ${name},
      </p>

      <h1 style="
        margin:0 0 16px;
        font-size:24px;
      ">
        Welcome aboard!
      </h1>

      <p style="
        margin:0 0 24px;
        color:#4b5563;
        line-height:1.6;
        font-size:15px;
      ">
        Your account is ready. You can now start using the platform.
      </p>

      ${
        dashboardUrl
          ? `
          <a
            href="${dashboardUrl}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:#111827;
              color:#fff;
              text-decoration:none;
              border-radius:6px;
              font-size:14px;
              font-weight:bold;
            "
          >
            Go to Dashboard
          </a>
        `
          : ""
      }
    `,
  });
};