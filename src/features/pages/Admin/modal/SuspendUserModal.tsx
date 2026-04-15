import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { getFullName, userService, type User } from "../services/userService";

type Props = {
  onClose: () => void;
  refresh: () => void;
  user: User;
};

const DURATION_OPTIONS = [1, 3, 7, 30];

export function SuspendUserModal({ user, onClose, refresh }: Props) {
  const [days, setDays] = useState(3);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  async function handleSuspend() {
    if (!reason.trim()) {
      setError("Suspension reason is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await userService.suspendUser(user.id, {
        days,
        reason,
      });

      refresh();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to suspend user");
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
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Suspend User</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose how long <span className="font-medium text-slate-700">{getFullName(user)}</span>
              {" "}will be restricted.
            </p>
          </div>

          <button
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <p className="mb-3 text-sm font-medium text-slate-600">Suspension duration</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DURATION_OPTIONS.map((duration) => {
                const active = days === duration;

                return (
                  <button
                    key={duration}
                    className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "border-amber-400 bg-amber-50 text-amber-800"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                    onClick={() => setDays(duration)}
                    type="button"
                  >
                    {duration} day{duration > 1 ? "s" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Reason</span>
            <textarea
              className="min-h-[120px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500"
              onChange={(event) => setReason(event.target.value)}
              placeholder="Enter suspension reason..."
              rows={4}
              value={reason}
            />
          </label>
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
            className="rounded-2xl bg-amber-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
            onClick={handleSuspend}
            type="button"
          >
            {loading ? "Suspending..." : "Suspend User"}
          </button>
        </div>
      </div>
    </div>
  );
}
