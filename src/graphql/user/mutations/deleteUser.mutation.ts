import { User } from "../../../models/authmodels.ts";
import { GraphQLError } from "graphql";
import logger from "../../../configs/logger.ts";

/**
 * Delete user mutation (placeholder - implement as needed)
 */
export const deleteUserMutation = async (
    _: unknown,
    { id }: { id: string }
): Promise<{ message: string; success: boolean }> => {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            throw new GraphQLError("User not found", {
                extensions: { code: "NOT_FOUND" },
            });
        }

        // Add delete logic here
        logger.info(`User deleted: ${id}`);

        return {
            message: "User deleted successfully",
            success: true,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("Delete user error:", message);

        if (error instanceof GraphQLError) {
            throw error;
        }

        throw new GraphQLError(`Failed to delete user: ${message}`, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
    }
};
