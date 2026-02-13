import bcrypt from "bcrypt";
import config from "../../../configs/config.ts";

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, config.security.bcryptSaltRounds);
};
