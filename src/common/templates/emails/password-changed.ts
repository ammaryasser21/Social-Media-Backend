import layout from "./layout.js";

export const passwordChangedEmail = ({
  name = "there",
}: { name: string }) => {
  return layout({
    title: "Password changed",
    content: `
      <p style="margin:0 0 8px;color:#6b7280;font-size:15px;">
        Hi ${name},
      </p>

      <h1 style="
        margin:0 0 16px;
        font-size:24px;
      ">
        Your password was changed
      </h1>

      <p style="
        margin:0 0 20px;
        color:#4b5563;
        line-height:1.6;
        font-size:15px;
      ">
        Your account password was successfully updated.
      </p>

      <div style="
        padding:14px 16px;
        background:#fef3c7;
        border:1px solid #fde68a;
        border-radius:6px;
        color:#92400e;
        font-size:13px;
      ">
        If you didn't make this change, please contact support immediately.
      </div>
    `,
  });
};