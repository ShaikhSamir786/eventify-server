import nodemailer from "nodemailer";
import { transporter } from "./config/transporter.ts";
import { getVerificationEmailTemplate } from "./templates/index.ts";
import config from "../configs/config.ts";

export async function sendVerificationEmail(
  to: string,
  otp: string
): Promise<nodemailer.SentMessageInfo> {
  const { subject, html, text } = getVerificationEmailTemplate(otp);

  const info = await transporter.sendMail({
    from: `"My App" <${config.mailService.userName}>`,
    to,
    subject,
    text,
    html,
  });

  return info;
}
