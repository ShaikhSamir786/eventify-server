import { userSchema } from "./user.schema.ts";
import { DateTime } from "./user.types.ts";
import { getUserQuery } from "./queries/getUser.query.ts";
import { getUsersQuery } from "./queries/getUsers.query.ts";
import { meQuery } from "./queries/me.query.ts";
import { createUserMutation } from "./mutations/createUser.mutation.ts";
import { loginUserMutation } from "./mutations/loginUser.mutation.ts";
import { verifyEmailService } from "./services/verifyEmail.service.ts";
import { resendOTPService } from "./services/resendOTP.service.ts";
import { changePasswordService } from "./services/changePassword.service.ts";
import { forgotPasswordService } from "./services/forgotPassword.service.ts";
import { resetPasswordService } from "./services/resetPassword.service.ts";
import { logoutService } from "./services/logout.service.ts";
import jwt from "jsonwebtoken";
import config from "../../configs/config.ts";
import logger from "../../configs/logger.ts";
import { GraphQLError } from "graphql";

// Export schema type definitions
const userTypedefMap = [userSchema];

// Export resolvers
const userResolverMap = {
    Query: {
        users: getUsersQuery,
        user: getUserQuery,
        me: meQuery,
    },
    Mutation: {
        createUser: createUserMutation,
        login: loginUserMutation,

        // Service-based mutations
        verifyEmail: async (_: unknown, { input }: { input: { email: string; otp: string } }) => {
            return await verifyEmailService(input.email, input.otp);
        },

        logout: async (_: unknown, __: unknown, context: any) => {
            try {
                const { token, ip } = context;

                if (!token) {
                    logger.info(`Logout request with no token from IP: ${ip || "unknown"}`);
                    return {
                        message: "No active session found",
                        success: true,
                    };
                }

                try {
                    const decoded = jwt.verify(token, config.security.jwtSecret) as { id: string; email: string };
                    return await logoutService(decoded.id, ip);
                } catch (tokenError: unknown) {
                    const errMessage = tokenError instanceof Error ? tokenError.message : "Unknown error";
                    logger.error("Token verification error:", errMessage);
                    return {
                        message: "Invalid session",
                        success: true,
                    };
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Unknown error";
                logger.error("Logout Error:", message, "IP:", context.ip);
                throw new GraphQLError(`Logout failed: ${message}`, {
                    extensions: { code: "INTERNAL_SERVER_ERROR" },
                });
            }
        },

        changePassword: async (_: unknown, { input }: { input: { currentPassword: string; newPassword: string } }, context: any) => {
            const { currentPassword, newPassword } = input;
            const { user: contextUser, ip } = context;

            if (!contextUser) {
                throw new GraphQLError("Authentication required", {
                    extensions: { code: "UNAUTHENTICATED" },
                });
            }

            return await changePasswordService(contextUser.id, currentPassword, newPassword, ip);
        },

        forgotPassword: async (_: unknown, { input }: { input: { email: string } }, context: any) => {
            const { email } = input;
            const { ip } = context;
            return await forgotPasswordService(email, ip);
        },

        resetPassword: async (_: unknown, { input }: { input: { email: string; otp: string; newPassword: string } }, context: any) => {
            const { email, otp, newPassword } = input;
            const { ip } = context;
            return await resetPasswordService(email, otp, newPassword, ip);
        },

        resendOTP: async (_: unknown, { email }: { email: string }, context: any) => {
            const { ip } = context;
            return await resendOTPService(email, ip);
        },
    },
    DateTime,
};

export { userTypedefMap, userResolverMap };
