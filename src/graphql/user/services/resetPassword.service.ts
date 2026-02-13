import { User } from "../../../models/authmodels.ts";
import { hashPassword } from "../functions/hashPassword.ts";
import { verifyOtp } from "../../../utils/otp-service.ts";
import logger from "../../../configs/logger.ts";
import { GraphQLError } from "graphql";

/**
 * Reset password with OTP
 */
export const resetPasswordService = async (
    email: string,
    otp: string,
    newPassword: string,
    ip?: string
): Promise<{ message: string; success: boolean }> => {
    try {
        if (!email || !otp || !newPassword) {
            throw new GraphQLError("Email, OTP, and new password are required", {
                extensions: { code: "BAD_USER_INPUT" },
            });
        }

        if (newPassword.length < 6) {
            throw new GraphQLError(
                "New password must be at least 6 characters long",
                {
                    extensions: { code: "BAD_USER_INPUT" },
                }
            );
        }

        const user = await User.findOne({
            where: { email: email.toLowerCase().trim() },
        });
        if (!user) {
            throw new GraphQLError("Invalid OTP or email", {
                extensions: { code: "BAD_USER_INPUT" },
            });
        }

        if (!user.otp || !user.otpExpiry) {
            throw new GraphQLError("OTP not generated or expired", {
                extensions: { code: "BAD_REQUEST" },
            });
        }

        if (user.otpExpiry < new Date()) {
            user.otp = null;
            user.otpExpiry = null;
            await user.save();

            throw new GraphQLError("OTP has expired. Please request a new one.", {
                extensions: { code: "BAD_REQUEST" },
            });
        }

        const isOtpValid = verifyOtp(otp, user.otp);
        if (!isOtpValid) {
            throw new GraphQLError("Invalid OTP", {
                extensions: { code: "BAD_USER_INPUT" },
            });
        }

        const hashedPassword = await hashPassword(newPassword);

        user.password = hashedPassword;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        logger.info(
            `Password reset successful for: ${email} from IP: ${ip || "unknown"}`
        );

        return {
            message: "Password reset successfully",
            success: true,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("ResetPassword Error:", message, "IP:", ip);

        if (error instanceof GraphQLError) {
            throw error;
        }

        throw new GraphQLError(`Password reset failed: ${message}`, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
    }
};
