import { eventSchema } from "./event.schema.ts";
import { DateTime } from "./event.types.ts";
import { myEventsQuery } from "./queries/myEvents.query.ts";
import { getEventQuery } from "./queries/getEvent.query.ts";
import { invitedEventsQuery } from "./queries/invitedEvents.query.ts";
import { createEventMutation } from "./mutations/createEvent.mutation.ts";
import { updateEventMutation } from "./mutations/updateEvent.mutation.ts";
import { deleteEventMutation } from "./mutations/deleteEvent.mutation.ts";
import { inviteParticipantsMutation } from "./mutations/inviteParticipants.mutation.ts";

// Export schema type definitions
const eventTypedefMap = [eventSchema];

// Export resolvers
const eventResolverMap = {
    Query: {
        myEvents: myEventsQuery,
        event: getEventQuery,
        invitedEvents: invitedEventsQuery,
    },
    Mutation: {
        createEvent: createEventMutation,
        updateEvent: updateEventMutation,
        deleteEvent: deleteEventMutation,
        inviteParticipants: inviteParticipantsMutation,
    },
    DateTime,
};

export { eventTypedefMap, eventResolverMap };
