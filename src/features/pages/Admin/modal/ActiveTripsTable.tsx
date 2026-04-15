import { phTime } from "@/lib/time";
import { useLoading } from "@/features/shared/context/LoadingContext";

type ActiveTripRow = {
  driver?: string | null;
  id: string;
  route?: string | null;
  scheduled_departure_time?: string | null;
  start_time?: string | null;
  status: string;
  vehicle?: string | null;
};

type Props = {
  onCancel: (trip: ActiveTripRow) => void;
  onEnd: (trip: ActiveTripRow) => void;
  onReschedule: (trip: ActiveTripRow) => void;
  trips: ActiveTripRow[];
};

function renderTripTime(trip: ActiveTripRow) {
  return trip.status === "scheduled"
    ? phTime(trip.scheduled_departure_time ?? null)
    : phTime(trip.start_time ?? null);
}

export function ActiveTripsTable({ trips, onCancel, onEnd, onReschedule }: Props) {
  const { loading } = useLoading();

  return (
    <section className="flex min-h-0 flex-col rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Active Trips</h2>
          <p className="text-sm text-slate-500">Monitor scheduled and ongoing operations at a glance.</p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          {trips.length} active
        </div>
      </div>

      <div className="md:hidden">
        {loading ? (
          <div className="px-4 py-10 text-center text-sm text-slate-400">Loading trips...</div>
        ) : trips.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-400">No active trips.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {trips.map((trip) => (
              <article key={trip.id} className="space-y-4 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{trip.route}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {trip.vehicle} • {trip.driver}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    {trip.status}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">
                    <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Vehicle</dt>
                    <dd className="mt-1 text-slate-700">{trip.vehicle}</dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">
                    <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Time</dt>
                    <dd className="mt-1 text-slate-700">{renderTripTime(trip)}</dd>
                  </div>
                </dl>

                {trip.status === "scheduled" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="flex-1 rounded-2xl bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
                      onClick={() => onReschedule(trip)}
                      type="button"
                    >
                      Reschedule
                    </button>
                    <button
                      className="flex-1 rounded-2xl bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
                      onClick={() => onCancel(trip)}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {trip.status === "ongoing" && (
                  <button
                    className="w-full rounded-2xl bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
                    onClick={() => onEnd(trip)}
                    type="button"
                  >
                    End Trip
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="hidden min-h-0 overflow-auto md:block">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-emerald-950 text-left text-white">
            <tr>
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Driver</th>
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-10 text-center text-slate-400" colSpan={5}>
                  Loading trips...
                </td>
              </tr>
            )}

            {!loading && trips.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-slate-400" colSpan={5}>
                  No active trips.
                </td>
              </tr>
            )}

            {!loading &&
              trips.map((trip) => (
                <tr key={trip.id} className="border-b border-slate-100 transition hover:bg-slate-50/80">
                  <td className="px-4 py-4 text-slate-700">{trip.vehicle}</td>
                  <td className="px-4 py-4 text-slate-700">{trip.driver}</td>
                  <td className="px-4 py-4 font-medium text-slate-900">{trip.route}</td>
                  <td className="px-4 py-4 text-slate-700">{renderTripTime(trip)}</td>
                  <td className="px-4 py-4 text-right">
                    {trip.status === "scheduled" && (
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-sky-700"
                          onClick={() => onReschedule(trip)}
                          type="button"
                        >
                          Reschedule
                        </button>
                        <button
                          className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-900"
                          onClick={() => onCancel(trip)}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {trip.status === "ongoing" && (
                      <button
                        className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-rose-700"
                        onClick={() => onEnd(trip)}
                        type="button"
                      >
                        End Trip
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
