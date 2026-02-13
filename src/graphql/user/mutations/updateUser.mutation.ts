import { User } from "../../../models/authmodels.ts";
import { GraphQLError } from "graphql";
import logger from "../../../configs/logger.ts";

/**
 * Update user mutation (placeholder - implement as needed)
 */
export const updateUserMutation = async (
    _: unknown,
    { id, input }: { id: string; input: Partial<User> }
): Promise<{ message: string; success: boolean }> => {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            throw new GraphQLError("User not found", {
                extensions: { code: "NOT_FOUND" },
            });
        }

        // Add update logic here
        logger.info(`User updated: ${id}`);

        return {
            message: "User updated successfully",
            success: true,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("Update user error:", message);

        if (error instanceof GraphQLError) {
            throw error;
        }

        throw new GraphQLError(`Failed to update user: ${message}`, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
    }
};
