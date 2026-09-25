import { EmailLayoutType } from "../../interfaces/email.interface";

const emailLayout = ({
  title,
  content,
  appName = "Your App",
}:EmailLayoutType) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f5f7fa;
  font-family:Arial,Helvetica,sans-serif;
  color:#111827;
">

<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="padding:40px 16px;">

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
          max-width:560px;
          background:#ffffff;
          border:1px solid #e5e7eb;
          border-radius:10px;
          overflow:hidden;
        "
      >

        <!-- Header -->
        <tr>
          <td style="
            padding:24px 30px;
            border-bottom:1px solid #e5e7eb;
          ">
            <div style="
              font-size:20px;
              font-weight:bold;
              color:#111827;
            ">
              ${appName}
            </div>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding:32px 30px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="
            padding:20px 30px;
            background:#f9fafb;
            border-top:1px solid #e5e7eb;
            text-align:center;
          ">
            <p style="
              margin:0;
              font-size:12px;
              color:#9ca3af;
            ">
              © ${new Date().getFullYear()} ${appName}. All rights reserved.
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
`;
};

export default  emailLayout;