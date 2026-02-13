import { User } from "../../../models/authmodels.ts";
import { comparePassword } from "../functions/comparePassword.ts";
import { generateUserToken } from "../functions/generateUserToken.ts";
import { GraphQLError } from "graphql";
import logger from "../../../configs/logger.ts";

interface LoginInput {
    email: string;
    password: string;
}

interface LoginResponse {
    message: string;
    token: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    success: boolean;
}

interface GraphQLContext {
    ip?: string;
    [key: string]: unknown;
}

/**
 * Login user mutation
 */
export const loginUserMutation = async (
    _: unknown,
    { input }: { input: LoginInput },
    context: GraphQLContext
): Promise<LoginResponse> => {
    try {
        const { email, password } = input;
        const clientIp = context.ip || "unknown";

        if (!email || !password) {
            throw new GraphQLError("Email and password are required", {
                extensions: { code: "BAD_USER_INPUT" },
            });
        }

        const sanitizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ where: { email: sanitizedEmail } });

        if (!user) {
            throw new GraphQLError("Invalid email or password", {
                extensions: { code: "UNAUTHENTICATED" },
            });
        }

        if (!user.dataValues.verified) {
            throw new GraphQLError("Please verify your email first", {
                extensions: { code: "FORBIDDEN" },
            });
        }

        if (!user.dataValues.isActive) {
            throw new GraphQLError(
                "Your account is inactive. Please contact support.",
                {
                    extensions: { code: "FORBIDDEN" },
                }
            );
        }

        const match = await comparePassword(password, user.dataValues.password);
        if (!match) {
            throw new GraphQLError("Invalid email or password", {
                extensions: { code: "UNAUTHENTICATED" },
            });
        }

        const token = generateUserToken({
            email: user.dataValues.email,
            id: user.dataValues.id,
        });

        logger.info(`Successful login: ${email} from IP: ${clientIp}`);

        return {
            message: "Login successful",
            token,
            user: {
                id: user.dataValues.id,
                email: user.dataValues.email,
                firstName: user.dataValues.firstName,
                lastName: user.dataValues.lastName,
            },
            success: true,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("Login Error:", message, "IP:", context.ip);

        if (error instanceof GraphQLError) {
            throw error;
        }

        throw new GraphQLError(`Login failed: ${message}`, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
    }
};
