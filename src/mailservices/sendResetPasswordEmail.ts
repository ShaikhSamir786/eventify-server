import nodemailer from "nodemailer";
import { transporter } from "./config/transporter.ts";
import { getResetPasswordEmailTemplate } from "./templates/index.ts";
import config from "../configs/config.ts";

export async function sendResetPassword(
  to: string,
  otpForResetPassword: string
): Promise<nodemailer.SentMessageInfo> {
  const { subject, html, text } = getResetPasswordEmailTemplate(otpForResetPassword);

  try {
    const info = await transporter.sendMail({
      from: `"My App" <${config.mailService.userName}>`,
      to,
      subject,
      text,
      html,
    });

    return info;
  } catch (error: any) {
    console.error("❌ Error sending reset password email:", error.message);
    throw new Error("Email sending failed");
  }
}
