export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const getInvalidEmails = (emails: string[]): string[] => {
    return emails.filter((email) => !validateEmail(email));
};

export const normalizeEmails = (emails: string[]): string[] => {
    return emails.map((email) => email.toLowerCase().trim());
};
