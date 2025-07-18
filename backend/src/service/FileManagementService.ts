import { PrismaClient } from "../../prisma/generated/prisma";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FileAsset } from "../../prisma/generated/prisma";

type CreateAssetParams = {
  filename: string;
  mimeType: string;
  userId: string;
  isPublic: boolean;
};

export class FileManagementService {
  constructor(
    private prisma: PrismaClient,
    private s3: S3Client,
    private bucketName: string
  ) {}

  /**
   * Creates a new file asset, generates a signed upload URL, and returns both.
   * @param data
   * @returns
   */
  async createAsset(data: CreateAssetParams): Promise<{
    asset: FileAsset;
    signedUploadUrl: string;
  }> {
    return await this.prisma.$transaction(async (tx) => {
      const s3Key = crypto.randomUUID(); // Generate a unique S3 key for the file
      const asset = await this.prisma.fileAsset.create({
        data: {
          filename: data.filename,
          mimeType: data.mimeType,
          s3Key: s3Key,
          userId: data.userId,
          isPublic: data.isPublic,
        },
      });
      const signedUploadUrl = await this.generateUploadSignedUrl({
        s3Key: s3Key,
        contentType: data.mimeType,
        isPublic: data.isPublic,
      });
      return { asset, signedUploadUrl };
    });
  }

  async getAssetById(id: string) {
    return this.prisma.fileAsset.findUnique({
      where: { id },
    });
  }

  async deleteAsset(id: string): Promise<FileAsset | null> {
    return await this.prisma.$transaction(async (tx) => {
      const asset = await tx.fileAsset.findUnique({
        where: { id },
      });

      if (!asset) {
        return null;
      }

      const { s3Key } = asset;

      // first, delete the file from the db
      await tx.fileAsset.delete({
        where: { id },
      });

      // Optionally delete the file from S3
      const deleteCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });
      await this.s3.send(deleteCommand); // Delete the file from S3

      return asset;
    });
  }

  /**
   * Generate a signed URL for downloading a file from S3
   */
  async generateDownloadSignedUrl(
    s3Key: string,
    expiresInSeconds = 3600
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }

  /**
   * Generate a signed URL for uploading a file to S3
   */
  async generateUploadSignedUrl(
    params: { s3Key: string; contentType: string; isPublic: boolean },
    expiresInSeconds = 3600
  ): Promise<string> {
    const { s3Key, contentType, isPublic } = params;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: contentType,
      ACL: isPublic ? "public-read" : "private",
    });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }

  /**
   * Mark an asset as successfully uploaded.
   */
  async markAssetAsUploaded(id: string): Promise<FileAsset | null> {
    return this.prisma.fileAsset.update({
      where: { id },
      data: { isUploaded: true },
    });
  }

  /**
   * Fetch all assets marked as uploaded for a given user ID
   */
  async getUploadedAssetsByUserId(userId: string): Promise<FileAsset[]> {
    return this.prisma.fileAsset.findMany({
      where: { userId, isUploaded: true },
    });
  }
}
