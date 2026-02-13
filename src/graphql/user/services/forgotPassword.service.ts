import { User } from "../../../models/authmodels.ts";
import { generateOTP, hashOtp } from "../../../utils/otp-service.ts";
import { sendResetPassword } from "../../../mailservices/send-reset-mail.ts";
import logger from "../../../configs/logger.ts";
import { GraphQLError } from "graphql";

/**
 * Forgot password - send OTP
 */
export const forgotPasswordService = async (
    email: string,
    ip?: string
): Promise<{ message: string; success: boolean }> => {
    try {
        if (!email) {
            throw new GraphQLError("Email is required", {
                extensions: { code: "BAD_USER_INPUT" },
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new GraphQLError("Invalid email format", {
                extensions: { code: "BAD_USER_INPUT" },
            });
        }

        const user = await User.findOne({
            where: { email: email.toLowerCase().trim() },
        });
        if (!user) {
            return {
                message: "If the email exists, OTP has been sent",
                success: true,
            };
        }

        if (!user.isActive) {
            return {
                message: "If the email exists, OTP has been sent",
                success: true,
            };
        }

        const otp = generateOTP();
        const hashedOtp = hashOtp(otp);

        user.otp = hashedOtp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        try {
            await sendResetPassword(user.email, otp);
            logger.info(
                `OTP sent successfully to: ${email} from IP: ${ip || "unknown"}`
            );
        } catch (emailError: unknown) {
            const errMessage =
                emailError instanceof Error ? emailError.message : "Unknown error";
            logger.error("Failed to send OTP email:", errMessage);
            throw new GraphQLError("Failed to send OTP. Please try again.", {
                extensions: { code: "INTERNAL_SERVER_ERROR" },
            });
        }

        return {
            message: "If the email exists, OTP has been sent",
            success: true,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("ForgotPassword Error:", message, "IP:", ip);

        if (error instanceof GraphQLError) {
            throw error;
        }

        throw new GraphQLError(
            `Failed to process forgot password request: ${message}`,
            {
                extensions: { code: "INTERNAL_SERVER_ERROR" },
            }
        );
    }
};
