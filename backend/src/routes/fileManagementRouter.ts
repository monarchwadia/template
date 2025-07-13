import { publicProcedure, router } from "../server/trpc";
import { z } from "zod";
import { Dependencies } from "../provideDependencies.types";


export const buildFileManagementRouter = (deps: Dependencies) => {
    const fileManagementRouter = router({
      getAssetById: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ input }) => {
          return deps.fileManagementService.getAssetById(input.id);
        }),
    
      getAssetsByUser: publicProcedure
        .input(z.object({ userId: z.string().uuid() }))
        .query(async ({ input }) => {
          return deps.fileManagementService.getAssetsByUser(input.userId);
        }),
    
      createAsset: publicProcedure
        .input(
          z.object({
            filename: z.string(),
            mimeType: z.string(),
            s3Key: z.string(),
            userId: z.string().uuid(),
            isPublic: z.boolean(),
          })
        )
        .mutation(async ({ input }) => {
          return deps.fileManagementService.createAsset(input);
        }),
    
      updateAsset: publicProcedure
        .input(
          z.object({
            id: z.string().uuid(),
            data: z.object({
              filename: z.string().optional(),
              mimeType: z.string().optional(),
              s3Key: z.string().optional(),
              isPublic: z.boolean().optional(),
            }),
          })
        )
        .mutation(async ({ input }) => {
          return deps.fileManagementService.updateAssetFields(input.id, input.data);
        }),
    
      deleteAsset: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ input }) => {
          return deps.fileManagementService.deleteAsset(input.id);
        }),
    
      generateDownloadSignedUrl: publicProcedure
        .input(z.object({ s3Key: z.string() }))
        .query(async ({ input }) => {
          return deps.fileManagementService.generateDownloadSignedUrl(input.s3Key);
        }),
    
      generateUploadSignedUrl: publicProcedure
        .input(
          z.object({
            s3Key: z.string(),
            mimeType: z.string(),
          })
        )
        .query(async ({ input }) => {
          return deps.fileManagementService.generateUploadSignedUrl(input.s3Key, input.mimeType);
        }),
    });

    return fileManagementRouter;
}
