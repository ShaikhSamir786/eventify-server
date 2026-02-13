import { User } from "../../../models/authmodels.ts";
import { GraphQLError } from "graphql";
import logger from "../../../configs/logger.ts";

interface GraphQLContext {
    user?: User | null;
    [key: string]: unknown;
}

/**
 * Get current authenticated user query
 */
export const meQuery = async (
    _: unknown,
    __: unknown,
    context: GraphQLContext
): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
} | null> => {
    try {
        const { user } = context;

        if (!user) {
            throw new GraphQLError("Authentication required", {
                extensions: { code: "UNAUTHENTICATED" },
            });
        }

        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("Me Query Error:", message);

        if (error instanceof GraphQLError) {
            throw error;
        }

        throw new GraphQLError("Failed to fetch current user", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
    }
};
