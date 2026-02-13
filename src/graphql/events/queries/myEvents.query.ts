import { GraphQLError } from "graphql";
import { Event } from "../../../models/event-model.ts";
import { User } from "../../../models/authmodels.ts";
import logger from "../../../configs/logger.ts";
import { getAuthenticatedUser, GraphQLContext } from "../functions/getAuthenticatedUser.ts";

/**
 * Get all events created by the current user
 */
export const myEventsQuery = async (
    _: unknown,
    __: unknown,
    context: GraphQLContext
): Promise<Event[]> => {
    const user = getAuthenticatedUser(context);

    try {
        const events = await Event.findAll({
            where: { createdBy: user.id },
            include: [{ model: User, as: "creator" }],
            order: [["date", "ASC"]],
        });

        return events;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error(`Failed to fetch events: ${message}`);
        throw new GraphQLError("Failed to fetch events", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
    }
};
