import React from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmLoading = false,
}) => {
  if (!open) return null;
  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{message}</p>
        <div className="modal-action">
          <button
            className="btn btn-error"
            onClick={onConfirm}
            disabled={confirmLoading}
          >
            {confirmLoading ? "Loading..." : confirmText}
          </button>
          <button className="btn" onClick={onCancel} disabled={confirmLoading}>
            {cancelText}
          </button>
        </div>
      </div>
    </dialog>
  );
};
