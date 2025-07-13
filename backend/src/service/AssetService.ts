
import { PrismaClient } from "../../prisma/generated/prisma";
// import AWS SDK or @aws-sdk/client-s3 for S3 signed URL generation
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FileAsset } from "../../prisma/generated/prisma";

export class FileManagementService {
    constructor(
        private prisma: PrismaClient,
        private s3: S3Client,
        private bucketName: string
    ) {}

    async createAsset(data: FileAsset) {
        return this.prisma.fileAsset.create({
            data: {
                filename: data.filename,
                mimeType: data.mimeType,
                s3Key: data.s3Key,
                userId: data.userId,
                isPublic: data.isPublic
            }
        });
    }

    async getAssetById(id: string) {
        return this.prisma.fileAsset.findUnique({
            where: { id }
        });
    }

    async getAssetsByUser(userId: string) {
        return this.prisma.fileAsset.findMany({
            where: { userId }
        });
    }

    async deleteAsset(id: string) {
        return this.prisma.fileAsset.delete({
            where: { id }
        });
    }

    async updateAsset(id: string, data: Partial<{ filename: string; type: string; s3Key: string; isPublic: boolean; }>) {
        return this.prisma.fileAsset.update({
            where: { id },
            data
        });
    }

    async updateAssetFields(id: string, data: Partial<Pick<FileAsset, 'filename' | 'mimeType' | 's3Key' | 'isPublic'>>) {
        return this.prisma.fileAsset.update({
            where: { id },
            data
        });
    }

    /**
     * Generate a signed URL for downloading a file from S3
     */
    async generateDownloadSignedUrl(s3Key: string, expiresInSeconds = 3600): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
        });
        return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
    }

    /**
     * Generate a signed URL for uploading a file to S3
     */
    async generateUploadSignedUrl(s3Key: string, contentType: string, expiresInSeconds = 3600): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
            ContentType: contentType,
        });
        return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
    }
}