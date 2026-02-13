import { GraphQLError } from "graphql";
import { User } from "../../../models/authmodels.ts";

export interface GraphQLContext {
    user?: User | null;
    [key: string]: unknown;
}

export const getAuthenticatedUser = (context: GraphQLContext): User => {
    const user = context.user;

    if (!user) {
        throw new GraphQLError("User not authenticated", {
            extensions: { code: "UNAUTHENTICATED" },
        });
    }

    return user;
};
