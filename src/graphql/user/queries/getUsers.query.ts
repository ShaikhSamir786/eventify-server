import { User } from "../../../models/authmodels.ts";
import { GraphQLError } from "graphql";
import logger from "../../../configs/logger.ts";

/**
 * Get all users query
 */
export const getUsersQuery = async (): Promise<User[]> => {
    try {
        return await User.findAll();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("Users Query Error:", message);
        throw new GraphQLError("Failed to fetch users", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
    }
};
