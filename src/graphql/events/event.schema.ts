import { gql } from "graphql-tag";

export const eventSchema = gql`
    scalar DateTime

    # Event type
    type Event {
        id: ID!
        title: String!
        description: String
        date: DateTime!
        location: String
        createdBy: User!
        invitedEmails: [String!]
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    # Input type for creating an event
    input EventInput {
        title: String!
        description: String
        date: DateTime!
        location: String
        invitedEmails: [String!]
    }

    # Input type for updating an event
    input UpdateEventInput {
        title: String
        description: String
        date: DateTime
        location: String
        invitedEmails: [String!]
    }

    # Input type for inviting participants
    input InviteParticipantsInput {
        eventId: ID!
        emails: [String!]!
    }

    # Response type for event operations
    type EventResponse {
        message: String!
        success: Boolean!
        event: Event
    }

    # Response type for invite operations
    type InviteResponse {
        message: String!
        success: Boolean!
        event: Event
    }

    # Queries
    type Query {
        # Get all events created by current user
        myEvents: [Event!]!

        # Get event by ID (only if user is creator or invited)
        event(id: ID!): Event

        # Get events where user is invited
        invitedEvents: [Event!]!
    }

    # Mutations
    type Mutation {
        createEvent(input: EventInput!): EventResponse!
        updateEvent(id: ID!, input: UpdateEventInput!): EventResponse!
        deleteEvent(id: ID!): EventResponse!
        inviteParticipants(input: InviteParticipantsInput!): InviteResponse!
    }
`;
