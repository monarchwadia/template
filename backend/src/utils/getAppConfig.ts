import z from "zod";


const appConfigSchema = z.object({
  jwtSecret: z.string().min(1, "JWT_SECRET must be set"),
  databaseUrl: z.string().url("DATABASE_URL must be a valid URL"),
  s3Region: z.string().min(1, "S3_REGION must be set"),
  s3AccessKeyId: z.string().min(1, "S3_ACCESS_KEY_ID must be set"),
  s3SecretAccessKey: z.string().min(1, "S3_SECRET_ACCESS_KEY must be set"),
  s3Bucket: z.string().min(1, "S3_BUCKET must be set"),
  s3Endpoint: z.string().url("S3_ENDPOINT must be a valid URL if provided").optional(),
  deployedFrontendRoot: z.string().url("DEPLOYED_FRONTEND_ROOT must be a valid URL").optional(),
  emailSender: z.string().email("EMAIL_SENDER must be a valid email address").optional(),
});

export const getAppConfig = () => {
    const config = {
        jwtSecret: process.env.JWT_SECRET,
        databaseUrl: process.env.DATABASE_URL,
        s3Region: process.env.S3_REGION,
        s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
        s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        s3Bucket: process.env.S3_BUCKET,
        s3Endpoint: process.env.S3_ENDPOINT,
        deployedFrontendRoot: process.env.DEPLOYED_FRONTEND_ROOT,
        emailSender: process.env.EMAIL_SENDER,
    };
    return appConfigSchema.parse(config);
}

export type AppConfig = z.infer<typeof appConfigSchema>;