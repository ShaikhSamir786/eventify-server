import { getBaseHtmlTemplate } from "./baseTemplate.ts";

export function getResetPasswordEmailTemplate(otp: string): {
    subject: string;
    html: string;
    text: string;
} {
    const subject = "Reset Password OTP";
    const content = `Your verification OTP is <b>${otp}</b>. It will expire in 10 minutes.`;

    return {
        subject,
        html: getBaseHtmlTemplate({ subject, content }),
        text: `Your verification OTP is ${otp}. It will expire in 10 minutes.`,
    };
}
