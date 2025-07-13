import { AssetService } from "./service/AssetService";
import { JwtService } from "./service/JwtService";
import { UserService } from "./service/UserService";

export interface Dependencies {
    userService: UserService;
    assetService: AssetService;
}