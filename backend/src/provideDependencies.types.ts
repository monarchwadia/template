import { FileManagementService } from "./service/FileManagementService";
import { UserService } from "./service/UserService";

export interface Dependencies {
    userService: UserService;
    fileManagementService: FileManagementService;
}