import { protectedProcedure, router } from "../server/trpc";
import { z } from "zod";
import { Dependencies } from "../provideDependencies.types";
import { TRPCError } from "@trpc/server";

export const buildFileManagementRouter = (deps: Dependencies) => {
    const fileManagementRouter = router({
        createAsset: protectedProcedure
            .input(z.object({
                fileName: z.string(),
                fileType: z.string(),
            }))
            .output(z.object({
                asset: z.object({
                    id: z.string(),
                    userId: z.string(),
                    filename: z.string(),
                    mimeType: z.string(),
                    isPublic: z.boolean(),
                    createdAt: z.date(),
                }),
                signedUploadUrl: z.string(),
            }))
            .mutation(async ({ input, ctx }) => {
                const { fileManagementService } = deps;
                if (!ctx.userId) {
                    throw new Error("User not authenticated");
                }

                const {asset, signedUploadUrl} = await fileManagementService.createAsset({
                    userId: ctx.userId,
                    filename: input.fileName,
                    mimeType: input.fileType,
                    isPublic: false // Default to private, can be changed later
                });

                return { asset, signedUploadUrl };
            }),
        deleteAsset: protectedProcedure
            .input(z.object({
                id: z.string(),
            }))
            .mutation(async ({ input, ctx }) => {
                const { fileManagementService } = deps;

                const asset = await fileManagementService.getAssetById(input.id);

                if (!asset) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Asset not found"
                    })
                }
                if (asset.userId !== ctx.userId) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "You do not have permission to delete this asset"
                    });
                }

                const deletedAsset = await fileManagementService.deleteAsset(input.id);

                if (!deletedAsset) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to delete asset"
                    });
                }
                
                return {
                    asset: deletedAsset,
                };
            }),
        confirmUpload: protectedProcedure
            .input(z.object({ assetId: z.string() }))
            .mutation(async ({ input, ctx }) => {
                const { fileManagementService } = deps;
                if (!ctx.userId) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
                // Fetch the asset to verify ownership
                const asset = await fileManagementService.getAssetById(input.assetId);
                if (!asset || asset.userId !== ctx.userId) {
                    throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot confirm upload for this asset' });
                }
                const updated = await fileManagementService.markAssetAsUploaded(input.assetId);
                if (!updated) {
                    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to confirm upload' });
                }
                return { asset: updated };
            }),
        getAssetsForUser: protectedProcedure
            .input(z.object({
                userId: z.string(),
            }))
            .output(z.array(z.object({
                id: z.string(),
                userId: z.string(),
                filename: z.string(),
                mimeType: z.string(),
                isPublic: z.boolean(),
                createdAt: z.date(),
                downloadUrl: z.string(),
            })))
            .query(async ({ input, ctx }) => {
                const { fileManagementService } = deps;
                if (input.userId !== ctx.userId) throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to view these assets' });
                const assets = await fileManagementService.getUploadedAssetsByUserId(input.userId);

                if (!assets || assets.length === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "No assets found for the user",
                    });
                }

                // For each asset, generate a signed download URL
                const assetsWithUrls = await Promise.all(
                  assets.map(async (asset) => ({
                    id: asset.id,
                    userId: asset.userId,
                    filename: asset.filename,
                    mimeType: asset.mimeType,
                    isPublic: asset.isPublic,
                    createdAt: asset.createdAt,
                    downloadUrl: await fileManagementService.generateDownloadSignedUrl(asset.s3Key),
                  }))
                );

                return assetsWithUrls;
            }),
    });

    return fileManagementRouter;
}
