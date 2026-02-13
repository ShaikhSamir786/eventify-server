import { Event } from "../../../models/event-model.ts";
import { User } from "../../../models/authmodels.ts";
import logger from "../../../configs/logger.ts";
import { getAuthenticatedUser, GraphQLContext } from "../functions/getAuthenticatedUser.ts";
import { getInvalidEmails, normalizeEmails } from "../functions/validateEmails.ts";

interface InviteParticipantsInput {
    eventId: string;
    emails: string[];
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

interface InviteParticipantsResponse {
    message: string;
    success: boolean;
    event: EventAttributes | null;
}

/**
 * Invite participants to an event
 */
export const inviteParticipantsMutation = async (
    _: unknown,
    args: { input: InviteParticipantsInput },
    context: GraphQLContext
): Promise<InviteParticipantsResponse> => {
    const user = getAuthenticatedUser(context);

    try {
        const { eventId, emails } = args.input;

        // Validation
        if (!eventId || !emails || !Array.isArray(emails) || emails.length === 0) {
            return {
                message: "Event ID and at least one email are required",
                success: false,
                event: null,
            };
        }

        // Validate email format
        const invalidEmails = getInvalidEmails(emails);

        if (invalidEmails.length > 0) {
            return {
                message: `Invalid email format: ${invalidEmails.join(", ")}`,
                success: false,
                event: null,
            };
        }

        // Find event
        const event = await Event.findByPk(eventId, {
            include: [{ model: User, as: "creator" }],
        });

        if (!event) {
            return {
                message: "Event not found",
                success: false,
                event: null,
            };
        }

        // Authorization - only creator can invite
        if (event.createdBy !== user.id) {
            logger.warn(
                `Unauthorized invite attempt by user ${user.id} on event ${eventId}`
            );
            return {
                message: "Only the event creator can invite participants",
                success: false,
                event: null,
            };
        }

        const normalizedEmails = normalizeEmails(emails);
        const currentEmails: string[] = event.invitedEmails || [];

        // Filter out duplicates and already invited emails
        const newEmails = normalizedEmails.filter(
            (email) => !currentEmails.includes(email) && email !== user.email
        );

        if (newEmails.length === 0) {
            return {
                message:
                    "All provided emails are already invited or belong to the event creator",
                success: false,
                event: null,
            };
        }

        // Update event with new emails
        const updatedEmails = [...currentEmails, ...newEmails];

        await Event.update(
            {
                invitedEmails: updatedEmails,
                updatedAt: new Date(),
            },
            { where: { id: eventId } }
        );

        // Fetch updated event
        const updatedEvent = await Event.findByPk(eventId, {
            include: [{ model: User, as: "creator" }],
        });

        logger.info(
            `User ${user.id} invited ${newEmails.length} participants to event ${eventId}`
        );

        return {
            message: `Successfully invited ${newEmails.length} participant(s) to the event`,
            success: true,
            event: updatedEvent ?? null,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error(
            `Failed to invite participants to event ${args.input?.eventId}: ${message}`
        );
        return {
            message: "Failed to invite participants: " + message,
            success: false,
            event: null,
        };
    }
};
