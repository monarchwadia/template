import z from "zod";

const appConfigSchema = z.object({
  jwtSecret: z.string().min(1, "JWT_SECRET must be set"),
  databaseUrl: z.string().url("DATABASE_URL must be a valid URL")
});

export const getAppConfig = () => {
    const config = {
        jwtSecret: process.env.JWT_SECRET,
        databaseUrl: process.env.DATABASE_URL
    };
    
    return appConfigSchema.parse(config);
}

export type AppConfig = z.infer<typeof appConfigSchema>;