import { PrismaClient } from "../prisma/generated/prisma";
import { FileManagementService } from "./service/FileManagementService";
import { UserService } from "./service/UserService";

export interface Dependencies {
    userService: UserService;
    fileManagementService: FileManagementService;
    prisma: PrismaClient;
}