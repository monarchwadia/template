import { PrismaClient } from "../prisma/generated/prisma";
import { FileManagementService } from "./service/FileManagementService";
import { UserService } from "./service/UserService";
import { CommunityService } from "./service/CommunityService";
import { CalendarEventsService } from "./service/CalendarEventsService";
import { EmailService } from "./service/EmailService";
import { AuthorizationUtils } from "./utils/AuthorizationUtils";

export interface Dependencies {
  userService: UserService;
  fileManagementService: FileManagementService;
  communityService: CommunityService;
  calendarEventsService: CalendarEventsService;
  emailService: EmailService;
  authorizationUtils: AuthorizationUtils;
  prisma: PrismaClient;
}
