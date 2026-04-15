import { useEffect, useState } from "react";
import { ShieldCheck, Trash2, UserPlus, UserX } from "lucide-react";
import { activityLogsService } from "./services/activityLogsService";

type ActivityLog = {
  action: string;
  created_at: string;
  description: string;
  id: string;
};

function getActionStyle(action: string) {
  switch (action) {
    case "CREATE_USER":
      return {
        color: "bg-emerald-100 text-emerald-700",
        icon: <UserPlus size={16} />,
      };
    case "DELETE_USER":
      return {
        color: "bg-rose-100 text-rose-700",
        icon: <Trash2 size={16} />,
      };
    case "SUSPEND_USER":
      return {
        color: "bg-amber-100 text-amber-700",
        icon: <UserX size={16} />,
      };
    default:
      return {
        color: "bg-slate-100 text-slate-700",
        icon: <ShieldCheck size={16} />,
      };
  }
}

export function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    try {
      const data = await activityLogsService.getLogs();
      setLogs(data);
    } catch (error) {
      console.error("Failed to load logs", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLogs();
  }, []);

  if (loading) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading activity logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700/60">
              Audit Trail
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              System Activity Logs
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Review administrative actions, monitor changes, and keep an operational trail you can
              scan comfortably on any screen size.
            </p>
          </div>

          <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            {logs.length} log entries
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold text-slate-900">Recent activity</h2>
          <p className="text-sm text-slate-500">Desktop table and mobile card view share the same data.</p>
        </div>

        <div className="md:hidden">
          {logs.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">No activity logs yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => {
                const style = getActionStyle(log.action);

                return (
                  <article key={log.id} className="space-y-3 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${style.color}`}
                      >
                        {style.icon}
                        {log.action}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{log.description}</p>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr className="text-slate-500">
                <th className="px-5 py-4 font-medium">Action</th>
                <th className="px-5 py-4 font-medium">Description</th>
                <th className="px-5 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const style = getActionStyle(log.action);

                return (
                  <tr key={log.id} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${style.color}`}
                      >
                        {style.icon}
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{log.description}</td>
                    <td className="px-5 py-4 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
