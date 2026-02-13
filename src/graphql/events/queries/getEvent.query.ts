import { GraphQLError } from "graphql";
import { Event } from "../../../models/event-model.ts";
import { User } from "../../../models/authmodels.ts";
import logger from "../../../configs/logger.ts";
import { getAuthenticatedUser, GraphQLContext } from "../functions/getAuthenticatedUser.ts";

/**
 * Get a single event by ID
 * User must be creator or invited to view
 */
export const getEventQuery = async (
    _: unknown,
    { id }: { id: string },
    context: GraphQLContext
): Promise<Event> => {
    const user = getAuthenticatedUser(context);

    try {
        const event = await Event.findByPk(id, {
            include: [{ model: User, as: "creator" }],
        });

        if (!event) {
            throw new GraphQLError("Event not found", {
                extensions: { code: "NOT_FOUND" },
            });
        }

        const isCreator = event.createdBy === user.id;
        const isInvited = event.invitedEmails?.includes(user.email) ?? false;

        if (!isCreator && !isInvited) {
            throw new GraphQLError("You are not authorized to view this event", {
                extensions: { code: "FORBIDDEN" },
            });
        }

        return event;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error(`Failed to fetch event: ${message}`);

        if (error instanceof GraphQLError) {
            throw error;
        }

        throw new GraphQLError("Failed to fetch event", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
    }
};
