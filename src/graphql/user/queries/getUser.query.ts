import { User } from "../../../models/authmodels.ts";
import { GraphQLError } from "graphql";
import logger from "../../../configs/logger.ts";

/**
 * Get single user by ID query
 */
export const getUserQuery = async (
    _: unknown,
    { id }: { id: string }
): Promise<User> => {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            throw new GraphQLError("User not found", {
                extensions: { code: "NOT_FOUND" },
            });
        }
        return user;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("User Query Error:", message);

        if (error instanceof GraphQLError) {
            throw error;
        }

        throw new GraphQLError("Failed to fetch user", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
    }
};
