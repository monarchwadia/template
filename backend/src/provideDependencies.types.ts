import { PrismaClient } from "../prisma/generated/prisma";
import { FileManagementService } from "./service/FileManagementService";
import { UserService } from "./service/UserService";
import { CommunityService } from "./service/CommunityService";
import { CalendarEventsService } from "./service/CalendarEventsService";
import { EmailService } from "./service/EmailService";

export interface Dependencies {
  userService: UserService;
  fileManagementService: FileManagementService;
  communityService: CommunityService;
  calendarEventsService: CalendarEventsService;
  emailService: EmailService;
  prisma: PrismaClient;
}
