import { PrismaClient } from '../../prisma/generated/prisma'
import { router } from "../server/trpc";
import { Dependencies } from '../provideDependencies.types';

const prisma = new PrismaClient();

export const buildCommunityRouter = (deps: Dependencies) => {
    const communityRouter = router({

    });
    return communityRouter;
}