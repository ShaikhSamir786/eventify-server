import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import config from "../../configs/config.ts";

export const transporter: Transporter = nodemailer.createTransport({
    host: config.mailService.host || "smtp.gmail.com",
    port: Number(config.mailService.port) || 587,
    secure: false, // true for port 465, false for others
    auth: {
        user: config.mailService.userName,
        pass: config.mailService.passWord,
    },
});
