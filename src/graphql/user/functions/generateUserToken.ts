import jwt from "jsonwebtoken";
import config from "../../../configs/config.ts";

interface TokenPayload {
    id: string;
    email: string;
}

export const generateUserToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, config.security.jwtSecret, {
        expiresIn: config.security.jwtExpiryIn,
    });
};
