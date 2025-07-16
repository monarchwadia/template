import { PrismaClient } from "../prisma/generated/prisma";
import { FileManagementService } from "./service/FileManagementService";
import { UserService } from "./service/UserService";
import { CommunityService } from "./service/CommunityService";

export interface Dependencies {
    userService: UserService;
    fileManagementService: FileManagementService;
    communityService: CommunityService;
    prisma: PrismaClient;
}