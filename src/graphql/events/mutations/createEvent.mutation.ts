import { Event } from "../../../models/event-model.ts";
import { User } from "../../../models/authmodels.ts";
import logger from "../../../configs/logger.ts";
import { getAuthenticatedUser, GraphQLContext } from "../functions/getAuthenticatedUser.ts";
import { validateEventDate } from "../functions/validateEventDate.ts";
import { normalizeEmails } from "../functions/validateEmails.ts";

interface CreateEventInput {
    title: string;
    description?: string | null;
    date: string;
    location?: string | null;
    invitedEmails?: string[];
}

interface CreateEventResponse {
    message: string;
    success: boolean;
    event: Event | null;
}

/**
 * Create a new event
 */
export const createEventMutation = async (
    _: unknown,
    { input }: { input: CreateEventInput },
    context: GraphQLContext
): Promise<CreateEventResponse> => {
    const user = getAuthenticatedUser(context);

    try {
        const {
            title,
            description,
            date,
            location,
            invitedEmails = [],
        } = input;

        // Validation
        if (!title || !date) {
            return {
                message: "Title and date are required",
                success: false,
                event: null,
            };
        }

        if (!validateEventDate(date)) {
            return {
                message: "Event date cannot be in the past",
                success: false,
                event: null,
            };
        }

        const eventDate = new Date(date);

        // Create the event
        const newEvent = await Event.create({
            title: title.trim(),
            description: description?.trim(),
            date: eventDate,
            location: location?.trim(),
            createdBy: user.id,
            invitedEmails: normalizeEmails(invitedEmails),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        logger.info(`Event created by user ${user.id}: ${title}`);

        // Fetch the event with creator details
        const eventWithCreator = await Event.findByPk(newEvent.id, {
            include: [{ model: User, as: "creator" }],
        });

        return {
            message: "Event created successfully",
            success: true,
            event: eventWithCreator,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error(`Failed to create event: ${message}`);
        return {
            message: `Failed to create event: ${message}`,
            success: false,
            event: null,
        };
    }
};
