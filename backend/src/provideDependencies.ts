import { PrismaClient } from "../prisma/generated/prisma";
import { Dependencies } from "./provideDependencies.types";
import { AssetService } from "./service/AssetService";
import { JwtService } from "./service/JwtService";
import { UserService } from "./service/UserService";
import { getAppConfig } from "./utils/getAppConfig";

let instance: Dependencies | null = null;

export const provideDependencies = (): Dependencies => {
  if (!instance) {
    const prisma = new PrismaClient();
    const appConfig = getAppConfig();
    const jwtService = new JwtService(appConfig.jwtSecret);
    instance = {
      userService: new UserService(prisma, jwtService),
      assetService: new AssetService(prisma),
    };
  }

  return instance;
};
