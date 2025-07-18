import { PrismaClient } from "../prisma/generated/prisma";
import { Dependencies } from "./provideDependencies.types";
import { FileManagementService } from "./service/FileManagementService";
import { S3Client } from "@aws-sdk/client-s3";
import { JwtService } from "./service/JwtService";
import { UserService } from "./service/UserService";
import { CommunityService } from "./service/CommunityService";
import { CalendarEventsService } from "./service/CalendarEventsService";
import { EmailService } from "./service/EmailService";
import { getAppConfig } from "./utils/getAppConfig";
import { AuthorizationUtils } from "./utils/AuthorizationUtils";

let instance: Dependencies | null = null;

export const provideDependencies = (): Dependencies => {
  if (!instance) {
    const prisma = new PrismaClient();
    const appConfig = getAppConfig();
    const jwtService = new JwtService(appConfig.jwtSecret);
    const s3 = new S3Client({
      region: appConfig.s3Region,
      credentials: {
        accessKeyId: appConfig.s3AccessKeyId,
        secretAccessKey: appConfig.s3SecretAccessKey,
      },
      endpoint: appConfig.s3Endpoint || undefined, // Optional endpoint for local S3 services
      forcePathStyle: !!appConfig.s3Endpoint, // Required for local S3 services like LocalStack or Min
    });
    const emailService = new EmailService(prisma);
    const authorizationUtils = new AuthorizationUtils(prisma);
    instance = {
      userService: new UserService(prisma, jwtService),
      fileManagementService: new FileManagementService(
        prisma,
        s3,
        appConfig.s3Bucket
      ),
      communityService: new CommunityService(prisma, authorizationUtils),
      calendarEventsService: new CalendarEventsService(prisma, emailService),
      emailService: emailService,
      authorizationUtils: authorizationUtils,
      prisma: prisma,
    };
  }

  return instance;
};
