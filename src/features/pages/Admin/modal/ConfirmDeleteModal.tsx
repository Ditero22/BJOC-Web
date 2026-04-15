import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

import { getFullName, userService, type User } from "../services/userService";

type Props = {
  onClose: () => void;
  refresh: () => void;
  user: User;
};

export function ConfirmDeleteModal({ user, onClose, refresh }: Props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  async function handleDelete() {
    try {
      setLoading(true);
      await userService.deleteUser(user.id);
      refresh();
      onClose();
    } catch (error) {
      console.error("Delete user failed", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Delete User</h2>
              <p className="mt-1 text-sm text-slate-500">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>

          <button
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{getFullName(user)}</span>?
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            disabled={loading}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
            onClick={handleDelete}
            type="button"
          >
            {loading ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
}
