import { useState } from "react";
import { trpcClient } from "../../clients/trpcClient";

type ConfigParams = {
  userId: string | undefined; // User ID for the asset owner
}

type UploadFileParams = {
  file: File; // The file to upload
}

export function useFileUpload({
  userId
}: ConfigParams) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const uploadFile = async ({ file }: UploadFileParams) => {
    if (!userId) {
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    const fileType = file.type || "application/octet-stream";
    const fileName = file.name;

    try {
      // 1. Request a signed upload URL and asset record from the backend
      const mimeType = fileType || "application/octet-stream";
      const { asset, signedUploadUrl } = await trpcClient.fileManagement.createAsset.mutate({
        fileName: fileName,
        fileType: mimeType,
      });

      // 2. Upload the file to S3 using the signed URL
      const uploadRes = await fetch(signedUploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": mimeType,
        },
        body: file,
      });

      if (!uploadRes.ok) throw new Error('Failed to upload file to S3');

      // 3. Confirm upload in backend to mark the record as uploaded
      await trpcClient.fileManagement.confirmUpload.mutate({ assetId: asset.id });
      setUploadSuccess(true);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      if (err instanceof Error) {
        setUploadError(err?.message || "Upload failed");
      } else {
        setUploadError("An unknown error occurred during upload");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadError,
    uploadSuccess,
    uploadFile,
  };
}
