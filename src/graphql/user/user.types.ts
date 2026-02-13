import { GraphQLScalarType, Kind } from "graphql";

export const DateTime = new GraphQLScalarType({
    name: "DateTime",
    description: "DateTime scalar type",
    serialize: (value: unknown): string => {
        if (value instanceof Date) {
            return value.toISOString();
        }
        return String(value);
    },
    parseValue: (value: unknown): Date => {
        return new Date(value as string);
    },
    parseLiteral: (ast): Date | null => {
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value);
        }
        return null;
    },
});
