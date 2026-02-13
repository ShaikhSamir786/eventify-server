import { Event } from "../../../models/event-model.ts";
import { User } from "../../../models/authmodels.ts";
import logger from "../../../configs/logger.ts";
import { getAuthenticatedUser, GraphQLContext } from "../functions/getAuthenticatedUser.ts";
import { validateEventDate } from "../functions/validateEventDate.ts";
import { normalizeEmails } from "../functions/validateEmails.ts";

interface UpdateEventInput {
    title?: string;
    description?: string;
    date?: string;
    location?: string;
    invitedEmails?: string[];
}

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

interface UpdateEventResponse {
    message: string;
    success: boolean;
    event: EventAttributes | null;
}

/**
 * Update an existing event
 */
export const updateEventMutation = async (
    _: unknown,
    args: { id: string; input: UpdateEventInput },
    context: GraphQLContext
): Promise<UpdateEventResponse> => {
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

        // Check if user is the creator
        if (event.createdBy !== user.id) {
            return {
                message: "You can only update events you created",
                success: false,
                event: null,
            };
        }

        const { title, description, date, location, invitedEmails } = args.input;

        // Partial update object
        const updateData: Partial<EventAttributes> = {};

        if (title) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description?.trim();
        if (date) {
            if (!validateEventDate(date)) {
                return {
                    message: "Event date cannot be in the past",
                    success: false,
                    event: null,
                };
            }
            updateData.date = new Date(date);
        }
        if (location !== undefined) updateData.location = location?.trim();
        if (invitedEmails !== undefined) {
            updateData.invitedEmails = normalizeEmails(invitedEmails);
        }
        updateData.updatedAt = new Date();

        await Event.update(updateData, { where: { id: args.id } });

        // Fetch updated event with creator relation
        const updatedEvent = await Event.findByPk(args.id, {
            include: [{ model: User, as: "creator" }],
        });

        logger.info(`Event updated by user ${user.id}: ${args.id}`);

        return {
            message: "Event updated successfully",
            success: true,
            event: updatedEvent ?? null,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error(`Failed to update event: ${message}`);
        return {
            message: "Failed to update event: " + message,
            success: false,
            event: null,
        };
    }
};
