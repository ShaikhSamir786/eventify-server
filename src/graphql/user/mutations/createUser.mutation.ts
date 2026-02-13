import { User } from "../../../models/authmodels.ts";
import { hashPassword } from "../functions/hashPassword.ts";
import { generateOTP, hashOtp } from "../../../utils/otp-service.ts";
import { sendVerificationEmail } from "../../../mailservices/sendVerificationEmail.ts";
import logger from "../../../configs/logger.ts";

interface CreateUserInput {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    verified?: boolean;
    isActive?: boolean;
}

interface CreateUserResponse {
    message: string;
    success: boolean;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        verified: boolean;
        isActive: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    } | null;
}

export const createUserMutation = async (
    _: unknown,
    { input }: { input: CreateUserInput }
): Promise<CreateUserResponse> => {
    try {
        const { email, firstName, lastName, password, verified, isActive } = input;

        if (!email || !password || !firstName || !lastName) {
            return {
                message: "All required fields must be provided",
                success: false,
                user: null,
            };
        }

        const sanitizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ where: { email: sanitizedEmail } });

        if (existingUser) {
            return {
                message: "User already exists",
                success: false,
                user: null,
            };
        }

        const hashedPassword = await hashPassword(password);
        const otp = generateOTP();
        const hashedOtp = hashOtp(otp);

        const newUser = await User.create(
            {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: sanitizedEmail,
                password: hashedPassword,
                otp: hashedOtp,
                otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
                verified: Boolean(verified ?? false),
                isActive: Boolean(isActive ?? false),
            },
            {
                returning: true,
            }
        );

        // Send verification email
        try {
            await sendVerificationEmail(sanitizedEmail, otp);
        } catch (err: unknown) {
            const errMessage = err instanceof Error ? err.message : "Unknown error";
            logger.warn("⚠️ Email sending failed:", errMessage);
        }

        logger.info(`User created: ${sanitizedEmail}`);

        return {
            message: "User created successfully",
            success: true,
            user: newUser.dataValues,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("❌ Create user error:", message);
        return {
            message: "Failed to create user: " + message,
            success: false,
            user: null,
        };
    }
};
