
import { useRef } from "react";
import { GuardMustBeLoggedIn } from "../../guards/GuardMustBeLoggedIn";
import { useFileUpload } from "./useFileUpload";
import { useUserProfile } from "../../hooks/useUserProfile";

export default function FileUploadRoute() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const user = useUserProfile();
  const userId = user?.id;

  const {
    isUploading,
    uploadError,
    uploadSuccess,
    handleUpload,
  } = useFileUpload({ userId });

  const handleFileChange = () => {
    if (fileInputRef.current != null && fileInputRef.current.files && fileInputRef.current.files[0]) {
      handleUpload({ file: fileInputRef.current.files[0] });
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
            disabled={isUploading}
          />
          {uploadError && <div className="text-error">{uploadError}</div>}
          {uploadSuccess && <div className="text-success">File uploaded successfully!</div>}
        </div>
      </div>
    </GuardMustBeLoggedIn>
  );
}
