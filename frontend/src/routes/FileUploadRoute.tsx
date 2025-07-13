
import { useRef, useState } from "react";
import { GuardMustBeLoggedIn } from "../guards/GuardMustBeLoggedIn";

export default function FileUploadRoute() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(false);
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    try {
      // TODO: Call backend to get signed upload URL, then upload file to S3
      // Example placeholder logic:
      // const { url } = await fetch("/api/get-upload-url", { method: "POST", body: ... })
      // await fetch(url, { method: "PUT", body: selectedFile })
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate upload
      setUploadSuccess(true);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      if (err instanceof Error) {
        setUploadError(err?.message || "Upload failed");
      } else {
        setUploadError("An unknown error occurred during upload");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <GuardMustBeLoggedIn>
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-2xl font-bold mb-6">File Upload</h2>
        <div className="border border-base-300 rounded-lg p-8 min-w-[300px] bg-base-100 shadow flex flex-col gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="file-input file-input-bordered"
            disabled={uploading}
          />
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          {uploadError && <div className="text-error">{uploadError}</div>}
          {uploadSuccess && <div className="text-success">File uploaded successfully!</div>}
        </div>
      </div>
    </GuardMustBeLoggedIn>
  );
}
