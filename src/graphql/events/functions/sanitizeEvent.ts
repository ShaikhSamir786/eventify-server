import { Event } from "../../../models/event-model.ts";

export const sanitizeEvent = (event: Event | null): Event | null => {
    if (!event) return null;
    return event;
};
