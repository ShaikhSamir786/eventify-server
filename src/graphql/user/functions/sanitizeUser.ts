import { User } from "../../../models/authmodels.ts";

export interface SanitizedUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    verified: boolean;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export const sanitizeUser = (user: User): SanitizedUser => {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        verified: user.verified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};
