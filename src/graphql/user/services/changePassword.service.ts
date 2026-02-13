import { User } from "../../../models/authmodels.ts";
import { comparePassword } from "../functions/comparePassword.ts";
import { hashPassword } from "../functions/hashPassword.ts";
import logger from "../../../configs/logger.ts";
import { GraphQLError } from "graphql";

/**
 * Change user password
 */
export const changePasswordService = async (
    userId: string,
    currentPassword: string,
    newPassword: string,
    ip?: string
): Promise<{ message: string; success: boolean }> => {
    try {
        if (!currentPassword || !newPassword) {
            throw new GraphQLError(
                "Current password and new password are required",
                {
                    extensions: { code: "BAD_USER_INPUT" },
                }
            );
        }

        if (newPassword.length < 6) {
            throw new GraphQLError(
                "New password must be at least 6 characters long",
                {
                    extensions: { code: "BAD_USER_INPUT" },
                }
            );
        }

        if (currentPassword === newPassword) {
            throw new GraphQLError(
                "New password must be different from current password",
                {
                    extensions: { code: "BAD_USER_INPUT" },
                }
            );
        }

        const user = await User.findByPk(userId);

        if (!user) {
            logger.error(`User not found in database. User ID: ${userId}`);
            throw new GraphQLError("User not found", {
                extensions: {
                    code: "NOT_FOUND",
                    details: `No user found with ID: ${userId}`,
                },
            });
        }

        const match = await comparePassword(currentPassword, user.password);
        if (!match) {
            logger.warn(
                `Failed password change attempt for user: ${user.email} from IP: ${ip || "unknown"
                }`
            );
            throw new GraphQLError("Current password is incorrect", {
                extensions: { code: "BAD_USER_INPUT" },
            });
        }

        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();

        logger.info(
            `Successful password change for user: ${user.email} from IP: ${ip || "unknown"
            }`
        );

        return {
            message: "Password changed successfully",
            success: true,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("ChangePassword Error:", message, "IP:", ip);

        if (error instanceof GraphQLError) {
            throw error;
        }

        throw new GraphQLError(`Password change failed: ${message}`, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
    }
};
