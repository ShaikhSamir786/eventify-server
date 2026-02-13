import { User } from "../../../models/authmodels.ts";
import logger from "../../../configs/logger.ts";
import { GraphQLError } from "graphql";

/**
 * Logout user
 */
export const logoutService = async (
    userId: string,
    ip?: string
): Promise<{ message: string; success: boolean }> => {
    try {
        const user = await User.findByPk(userId);

        if (user) {
            logger.info(
                `Successful logout for user: ${user.email} from IP: ${ip || "unknown"
                }`
            );
        }

        return {
            message: "Logout successful",
            success: true,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("Logout Error:", message, "IP:", ip);
        throw new GraphQLError(`Logout failed: ${message}`, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
    }
};
