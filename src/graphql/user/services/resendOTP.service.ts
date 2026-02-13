import { User } from "../../../models/authmodels.ts";
import { generateOTP, hashOtp } from "../../../utils/otp-service.ts";
import { sendVerificationEmail } from "../../../mailservices/mail.ts";
import logger from "../../../configs/logger.ts";
import { GraphQLError } from "graphql";

/**
 * Resend OTP to user email
 */
export const resendOTPService = async (
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

        if (user.dataValues.verified) {
            return {
                message: "Email is already verified",
                success: true,
            };
        }

        const otp = generateOTP();
        const hashedOtp = hashOtp(otp);

        await user.update({
            otp: hashedOtp,
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
        });

        try {
            await sendVerificationEmail(email, otp);
            logger.info(
                `OTP resent successfully to: ${email} from IP: ${ip || "unknown"}`
            );
        } catch (emailError: unknown) {
            const errMessage =
                emailError instanceof Error ? emailError.message : "Unknown error";
            logger.error("Failed to resend OTP email:", errMessage);
            throw new GraphQLError("Failed to send OTP. Please try again.", {
                extensions: { code: "INTERNAL_SERVER_ERROR" },
            });
        }

        return {
            message: "OTP has been resent to your email",
            success: true,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("ResendOTP Error:", message);

        if (error instanceof GraphQLError) {
            throw error;
        }

        throw new GraphQLError(`Failed to resend OTP: ${message}`, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
    }
};
