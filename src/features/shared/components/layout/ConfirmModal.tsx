import { X } from "lucide-react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
};

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm"
}: ConfirmModalProps) {

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-[400px] rounded-xl shadow-xl p-6 space-y-4">

        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button onClick={onCancel}>
            <X />
          </button>
        </div>

        <p className="text-gray-600 text-sm">{message}</p>

        <div className="flex justify-end gap-3 pt-2">

          <button
            onClick={onCancel}
            className="px-4 py-1.5 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {confirmText}
          </button>

        </div>

      </div>

    </div>
  );
}