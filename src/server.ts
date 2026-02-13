import express from "express";
import type { Request } from "express";
import jwt from "jsonwebtoken";
import logger from "./configs/logger.ts";
import config from "./configs/config.ts";
import { initializeCORS, corsErrorHandler } from "./configs/cors.ts";
import { sequelize } from "./configs/sequelize-postgre.ts";
import { initModels } from "./models/index-model.ts";
import { User } from "./models/authmodels.ts";
import { buildSchema, createApolloServer } from "./graphql/apollo-server.ts";
import { expressMiddleware } from "@as-integrations/express5";
import { rateLimitDirective } from "graphql-rate-limit-directive";
import limiter from "./middlewares/limiter.ts";

const app = express();
const PORT = config.app.port;

app.use(initializeCORS());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(limiter);

// Context type for GraphQL
export interface GraphQLContext {
  ip: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    verified: boolean;
    isActive: boolean;
  } | null;
  token: string | null;
}

// JWT payload type
interface JWTPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

const startServer = async (): Promise<void> => {
  try {
    logger.info("🟡 Connecting to database...");
    await sequelize.authenticate();
    logger.info("✅ Database connection established successfully.");

    logger.info("🟡 Syncing database models...");
    await initModels(sequelize);
    logger.info("✅ Models synced successfully.");

    const { rateLimitDirectiveTransformer } = rateLimitDirective({
      keyGenerator: (directiveArgs, obj, args, context, info) => {
        const ctx = context as unknown as GraphQLContext;
        return ctx.user?.id?.toString() || ctx.ip || "anonymous";
      },
    });

    let schema = buildSchema();

    schema = rateLimitDirectiveTransformer(schema);

    logger.info("🟡 Starting Apollo Server...");
    const server = createApolloServer();
    await server.start();

    app.use(
      "/graphql",
      expressMiddleware(server, {
        context: async ({ req }: { req: Request }): Promise<GraphQLContext> => {
          const context: GraphQLContext = {
            ip:
              (req.headers["x-forwarded-for"] as string)
                ?.split(",")[0]
                .trim() ||
              req.socket.remoteAddress ||
              "unknown",
            user: null,
            token: null,
          };

          try {
            const authHeader = req.headers.authorization || "";
            const token = authHeader.replace("Bearer ", "");

            if (token && config.security.jwtSecret) {
              const decoded = jwt.verify(
                token,
                config.security.jwtSecret
              ) as JWTPayload;

              const user = await User.findByPk(decoded.id);

              if (user) {
                context.user = {
                  id: user.id,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  verified: user.verified,
                  isActive: user.isActive,
                };
                context.token = token;
              }
            }
          } catch (error: unknown) {
            // This is normal for unauthenticated requests (login, register, etc.)
            // Only log at debug level to avoid noise
            const message =
              error instanceof Error ? error.message : "Unknown error";
            logger.debug("Context authentication:", message);
          }

          return context;
        },
      })
    );

    app.listen(PORT, () => {
      logger.info(`🚀 Server is running at: http://localhost:${PORT}/graphql`);
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("❌ Error starting the server:", message);
    process.exit(1);
  }
};

startServer();
