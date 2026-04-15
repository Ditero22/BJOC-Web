import { useEffect } from "react";
import { X } from "lucide-react";

import { getFullName } from "../services/userService";
import type { User, UserRole } from "../services/userService";

type Props = {
  onClose: () => void;
  user: User;
};

export function UserDetailsModal({ onClose, user }: Props) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const statusColor =
    user.status === "suspended"
      ? "bg-rose-100 text-rose-700"
      : "bg-emerald-100 text-emerald-700";

  const roleColors: Record<UserRole, string> = {
    admin: "bg-violet-100 text-violet-700",
    driver: "bg-amber-100 text-amber-700",
    operator: "bg-sky-100 text-sky-700",
    passenger: "bg-slate-100 text-slate-700",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">User Details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Full profile snapshot for this account.
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailCard className="sm:col-span-2" label="Name" value={getFullName(user)} />
          <DetailCard className="sm:col-span-2" label="Email" value={user.email ?? "-"} />
          <DetailCard label="Contact Number" value={user.contact_number ?? "-"} />
          <DetailCard label="Created At" value={user.created_at ? new Date(user.created_at).toLocaleString() : "-"} />

          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Role</p>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${roleColors[user.role]}`}>
              {user.role}
            </span>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status</p>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusColor}`}>
              {user.status ?? "active"}
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

type DetailCardProps = {
  className?: string;
  label: string;
  value: string;
};

function DetailCard({ className = "", label, value }: DetailCardProps) {
  return (
    <div className={`rounded-2xl bg-slate-50 px-4 py-4 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-sm text-slate-700">{value}</p>
    </div>
  );
}
