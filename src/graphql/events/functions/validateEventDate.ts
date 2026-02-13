export const validateEventDate = (date: string | Date): boolean => {
    const eventDate = new Date(date);
    const now = new Date();
    return eventDate >= now;
};
