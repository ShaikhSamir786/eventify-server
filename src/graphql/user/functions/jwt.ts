import jwt from "jsonwebtoken";
import config from "../../../configs/config.ts";

interface TokenPayload {
    id: number;
    email: string;
}

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, config.security.jwtSecret, {
        expiresIn: config.security.jwtExpiryIn,
    });
};

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, config.security.jwtSecret) as TokenPayload;
};
