import { Event } from "../../../models/event-model.ts";
import logger from "../../../configs/logger.ts";
import { getAuthenticatedUser, GraphQLContext } from "../functions/getAuthenticatedUser.ts";

interface EventAttributes {
    id: string;
    title: string;
    description?: string;
    date: Date;
    location?: string;
    invitedEmails?: string[];
    createdBy: string;
    updatedAt: Date;
}

interface DeleteEventResponse {
    message: string;
    success: boolean;
    event: EventAttributes | null;
}

/**
 * Delete an event
 */
export const deleteEventMutation = async (
    _: unknown,
    args: { id: string },
    context: GraphQLContext
): Promise<DeleteEventResponse> => {
    const user = getAuthenticatedUser(context);

    try {
        const event = await Event.findByPk(args.id);

        if (!event) {
            return {
                message: "Event not found",
                success: false,
                event: null,
            };
        }

        // Authorization check: only the creator can delete
        if (event.createdBy !== user.id) {
            return {
                message: "You can only delete events you created",
                success: false,
                event: null,
            };
        }

        await Event.destroy({ where: { id: args.id } });

        logger.info(`Event deleted by user ${user.id}: ${args.id}`);

        return {
            message: "Event deleted successfully",
            success: true,
            event: event,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error(`Failed to delete event: ${message}`);
        return {
            message: "Failed to delete event: " + message,
            success: false,
            event: null,
        };
    }
};
