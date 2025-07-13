import { useState } from "react";
import { trpcClient } from "../../clients/trpcClient";

type UseFileUploadParams = {
  userId: string | undefined; // User ID for the asset owner
}

type UploadFileParams = {
  fileName: string;
  fileType: string; // MIME type of the file
}

export function useFileUpload({
  userId
}: UseFileUploadParams) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const uploadFile = async ({file: File}) => {
    if (!userId) {
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    try {
      // 1. Request a signed upload URL and asset record from the backend
      const mimeType = fileType || "application/octet-stream";
      const { signedUploadUrl } = await trpcClient.fileManagement.createAsset.mutate({
        fileName: fileName,
        fileType: mimeType,
      });

      // 2. Upload the file to S3 using the signed URL
      const uploadRes = await fetch(signedUploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': mimeType,
        },
      });

      if (!uploadRes.ok) throw new Error('Failed to upload file to S3');

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
    handleUpload: uploadFile,
  };
}
