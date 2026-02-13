import { User } from "../../../models/authmodels.ts";
import { hashPassword } from "../functions/hashPassword.ts";
import { generateOTP, hashOtp, verifyOtp } from "../../../utils/otp-service.ts";
import { sendVerificationEmail } from "../../../mailservices/mail.ts";
import logger from "../../../configs/logger.ts";
import { GraphQLError } from "graphql";

/**
 * Verify user email with OTP
 */
export const verifyEmailService = async (
    email: string,
    otp: string
): Promise<{ message: string; success: boolean }> => {
    try {
        if (!email || !otp) {
            throw new GraphQLError("Email and OTP are required", {
                extensions: { code: "BAD_USER_INPUT" },
            });
        }

        const user = await User.findOne({
            where: { email: email.toLowerCase().trim() },
        });
        if (!user) {
            throw new GraphQLError("User not found", {
                extensions: { code: "NOT_FOUND" },
            });
        }

        const storedOtp = user.dataValues.otp;
        const storedOtpExpiry = user.dataValues.otpExpiry;
        const isVerified = user.dataValues.verified;

        if (isVerified) {
            throw new GraphQLError("Email already verified", {
                extensions: { code: "BAD_REQUEST" },
            });
        }

        if (!storedOtp) {
            throw new GraphQLError(
                "No OTP found for this user. Please request a new OTP.",
                {
                    extensions: { code: "BAD_REQUEST" },
                }
            );
        }

        if (!storedOtpExpiry || new Date(storedOtpExpiry) < new Date()) {
            throw new GraphQLError("OTP has expired", {
                extensions: { code: "BAD_REQUEST" },
            });
        }

        const match = verifyOtp(otp, storedOtp);

        if (!match) {
            throw new GraphQLError("Invalid OTP", {
                extensions: { code: "BAD_USER_INPUT" },
            });
        }

        await user.update({
            verified: true,
            otp: null,
            otpExpiry: null,
            isActive: true,
        });

        return {
            message: "Email verified successfully",
            success: true,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("VerifyEmail Error:", message);

        if (error instanceof GraphQLError) {
            throw error;
        }

        throw new GraphQLError(`Verification failed: ${message}`, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
    }
};
