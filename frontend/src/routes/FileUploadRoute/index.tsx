import { useRef } from "react";
import { GuardMustBeLoggedIn } from "../../guards/GuardMustBeLoggedIn";
import { useFileUpload } from "./useFileUpload";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useUploadedFilesForUser, invalidateUploadedFilesForUser } from '../../hooks/useUploadedFilesForUser';

export default function FileUploadRoute() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const user = useUserProfile();
  const userId = user?.data?.id;

  const {
    isUploading,
    uploadError,
    uploadSuccess,
    uploadFile,
  } = useFileUpload({ userId });

  const { data: uploadedFiles, isLoading: isFilesLoading } = useUploadedFilesForUser(userId);

  // Invalidate uploaded files when uploadSuccess changes to true
  if (uploadSuccess && userId) {
    invalidateUploadedFilesForUser(userId);
  }

  const handleFileChange = () => {
    if (fileInputRef.current != null && fileInputRef.current.files && fileInputRef.current.files[0]) {
      uploadFile({ file: fileInputRef.current.files[0] });
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
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Your Uploaded Images</h3>
          {isFilesLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedFiles && uploadedFiles.length > 0 ? (
                uploadedFiles.map((file) => (
                  <div key={file.id} className="border rounded p-2 flex flex-col items-center">
                    <span className="text-xs break-all mb-2">{file.filename}</span>
                    {/* Replace with actual image preview if you have a URL */}
                    <div className="w-24 h-24 bg-gray-200 flex items-center justify-center">
                      <span role="img" aria-label="file">📄</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-gray-500">No files uploaded yet.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </GuardMustBeLoggedIn>
  );
}
