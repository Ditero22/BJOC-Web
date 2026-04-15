import { useEffect, useState, type ReactNode } from "react";
import { Download, Search } from "lucide-react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ExportReportModal from "./modal/ExportReportModal";
import { activityLogsService } from "./services/activityLogsService";
import { reportsService } from "./services/reportsService";

type Trip = {
  actual_end: string;
  actual_start: string;
  driver_name: string;
  id: string;
  plate_number: string;
  route_name: string;
  scheduled_start: string;
};

type Passenger = {
  passengers: number;
  route: string;
};

type PeakHour = {
  hour: string;
  passengers: number;
};

type Trend = {
  date: string;
  passengers: number;
};

type Driver = {
  delayed: number;
  driver: string;
  onTime: number;
  trips: number;
};

type ActivityLog = {
  action: string;
  created_at: string;
  description: string;
  id: string;
};

type ReportRangePreset = "all" | "custom" | "month" | "week";

function formatOptionalDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function resolvePresetRange(range: Exclude<ReportRangePreset, "custom">) {
  if (range === "all") {
    return {
      endDate: "",
      startDate: "",
    };
  }

  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (range === "week" ? 6 : 29));

  return {
    endDate: toDateInputValue(endDate),
    startDate: toDateInputValue(startDate),
  };
}

function buildReportWindowLabel(
  range: ReportRangePreset,
  startDate: string,
  endDate: string,
) {
  if (range === "week") {
    return "Last 7 days";
  }

  if (range === "month") {
    return "Last 30 days";
  }

  if (range === "all") {
    return "All dates";
  }

  if (startDate && endDate) {
    return `${startDate} to ${endDate}`;
  }

  if (startDate) {
    return `From ${startDate}`;
  }

  if (endDate) {
    return `Until ${endDate}`;
  }

  return "Custom window";
}

export function AdminReportsHistory() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [trend, setTrend] = useState<Trend[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [reportRange, setReportRange] = useState<ReportRangePreset>("all");
  const [exportOpen, setExportOpen] = useState(false);

  async function loadReports(filters?: {
    endDate?: string;
    search?: string;
    startDate?: string;
  }) {
    const resolvedStartDate = filters?.startDate ?? startDate;
    const resolvedEndDate = filters?.endDate ?? endDate;
    const resolvedSearch = filters?.search ?? search;

    try {
      const [tripData, passengerVolume, peak, dailyTrend, driverData, logData] = await Promise.all([
        reportsService.getTrips({ endDate: resolvedEndDate, search: resolvedSearch, startDate: resolvedStartDate }),
        reportsService.getPassengerVolume(resolvedStartDate, resolvedEndDate),
        reportsService.getPeakHours(resolvedStartDate, resolvedEndDate),
        reportsService.getPassengerTrend(resolvedStartDate, resolvedEndDate),
        reportsService.getDriverReport(resolvedStartDate, resolvedEndDate, resolvedSearch),
        activityLogsService.getLogs(),
      ]);

      setTrips(tripData || []);
      setPassengers(passengerVolume || []);
      setPeakHours(peak || []);
      setTrend(dailyTrend || []);
      setDrivers(driverData || []);
      setLogs(Array.isArray(logData) ? logData : []);
    } catch (error) {
      console.error("Failed to load reports", error);
    }
  }

  useEffect(() => {
    void loadReports();
  }, []);

  const reportWindowLabel = buildReportWindowLabel(reportRange, startDate, endDate);

  function handleQuickRange(range: Exclude<ReportRangePreset, "custom">) {
    const nextFilters = resolvePresetRange(range);
    setReportRange(range);
    setStartDate(nextFilters.startDate);
    setEndDate(nextFilters.endDate);
    void loadReports(nextFilters);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700/60">
              Reporting Center
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Reports & History
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Explore trip history, route demand, and driver performance in a responsive analytics
              workspace.
            </p>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-900"
            onClick={() => setExportOpen(true)}
            type="button"
          >
            <Download size={14} />
            Export Report
          </button>
        </div>
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {([
            { label: "1 Week", value: "week" },
            { label: "1 Month", value: "month" },
            { label: "All", value: "all" },
          ] as const).map((option) => (
            <button
              key={option.value}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                reportRange === option.value
                  ? "bg-emerald-950 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
              onClick={() => handleQuickRange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
          <div className="ml-auto rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-500">
            Window: {reportWindowLabel}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[repeat(2,minmax(0,1fr))_minmax(0,1.4fr)_auto]">
          <input
            className="rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700"
            onChange={(event) => {
              setReportRange("custom");
              setStartDate(event.target.value);
            }}
            type="date"
            value={startDate}
          />

          <input
            className="rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700"
            onChange={(event) => {
              setReportRange("custom");
              setEndDate(event.target.value);
            }}
            type="date"
            value={endDate}
          />

          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <Search size={14} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search driver or jeepney"
              value={search}
            />
          </label>

          <button
            className="rounded-2xl bg-emerald-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-900"
            onClick={() => void loadReports()}
            type="button"
          >
            Apply Filters
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <ReportStat label="Total Trips" value={trips.length} />
        <ReportStat label="Drivers" value={drivers.length} />
        <ReportStat label="Routes with Passengers" value={passengers.length} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Passenger Volume per Route">
          <div className="h-[220px] sm:h-[250px]">
            <ResponsiveContainer>
              <BarChart barSize={22} data={passengers}>
                <XAxis dataKey="route" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="passengers" fill="#14532d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Peak Passenger Hours">
          <div className="h-[220px] sm:h-[250px]">
            <ResponsiveContainer>
              <BarChart barSize={22} data={peakHours}>
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="passengers" fill="#14532d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      <ChartCard title="Daily Passenger Trend">
        <div className="h-[230px] sm:h-[280px]">
          <ResponsiveContainer>
            <LineChart data={trend}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line dataKey="passengers" stroke="#14532d" strokeWidth={2} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <section className="rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold text-slate-900">Driver Performance</h2>
          <p className="text-sm text-slate-500">Performance summary for the selected report window.</p>
        </div>

        <div className="md:hidden">
          {drivers.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">No driver performance data.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {drivers.map((driver, index) => (
                <article key={`${driver.driver}-${index}`} className="space-y-3 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">{driver.driver}</h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                      {driver.trips} trips
                    </span>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <MetricCard label="On time" value={driver.onTime} valueClassName="text-emerald-700" />
                    <MetricCard label="Delayed" value={driver.delayed} valueClassName="text-rose-700" />
                  </dl>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[680px] w-full text-sm">
            <thead className="bg-emerald-950 text-left text-white">
              <tr>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">Trips</th>
                <th className="px-4 py-3 font-medium">On Time</th>
                <th className="px-4 py-3 font-medium">Delayed</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver, index) => (
                <tr key={`${driver.driver}-${index}`} className="border-b border-slate-100">
                  <td className="px-4 py-4 font-medium text-slate-900">{driver.driver}</td>
                  <td className="px-4 py-4 text-slate-600">{driver.trips}</td>
                  <td className="px-4 py-4 text-emerald-700">{driver.onTime}</td>
                  <td className="px-4 py-4 text-rose-700">{driver.delayed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold text-slate-900">Trip History</h2>
          <p className="text-sm text-slate-500">Historical route activity with actual and scheduled times.</p>
        </div>

        <div className="md:hidden">
          {trips.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">No trip history found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {trips.map((trip) => (
                <article key={trip.id} className="space-y-4 px-4 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{trip.route_name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {[trip.driver_name, trip.plate_number].filter(Boolean).join(" - ")}
                    </p>
                  </div>

                  <dl className="grid grid-cols-1 gap-3 text-sm">
                    <MobileReportRow label="Scheduled" value={formatOptionalDate(trip.scheduled_start)} />
                    <MobileReportRow label="Started" value={formatOptionalDate(trip.actual_start)} />
                    <MobileReportRow label="Ended" value={formatOptionalDate(trip.actual_end)} />
                  </dl>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="hidden max-h-[360px] overflow-auto md:block">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="sticky top-0 bg-emerald-950 text-left text-white">
              <tr>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Scheduled</th>
                <th className="px-4 py-3 font-medium">Started</th>
                <th className="px-4 py-3 font-medium">Ended</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id} className="border-b border-slate-100 transition hover:bg-slate-50/80">
                  <td className="px-4 py-4 font-medium text-slate-900">{trip.route_name}</td>
                  <td className="px-4 py-4 text-slate-600">{trip.driver_name}</td>
                  <td className="px-4 py-4 text-slate-600">{trip.plate_number}</td>
                  <td className="px-4 py-4 text-slate-600">{formatOptionalDate(trip.scheduled_start)}</td>
                  <td className="px-4 py-4 text-slate-600">{formatOptionalDate(trip.actual_start)}</td>
                  <td className="px-4 py-4 text-slate-600">{formatOptionalDate(trip.actual_end)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ExportReportModal
        drivers={drivers}
        logs={logs.map((log) => ({
          Action: log.action,
          Date: new Date(log.created_at).toLocaleString(),
          Description: log.description,
        }))}
        onClose={() => setExportOpen(false)}
        open={exportOpen}
        passengers={passengers}
        reportWindowLabel={reportWindowLabel}
        trips={trips}
      />
    </div>
  );
}

type ReportStatProps = {
  label: string;
  value: number;
};

function ReportStat({ label, value }: ReportStatProps) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

type ChartCardProps = {
  children: ReactNode;
  title: string;
};

function ChartCard({ children, title }: ChartCardProps) {
  return (
    <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 text-base font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

type MetricCardProps = {
  label: string;
  value: number;
  valueClassName: string;
};

function MetricCard({ label, value, valueClassName }: MetricCardProps) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-3">
      <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</dt>
      <dd className={`mt-2 text-lg font-semibold ${valueClassName}`}>{value}</dd>
    </div>
  );
}

type MobileReportRowProps = {
  label: string;
  value: string;
};

function MobileReportRow({ label, value }: MobileReportRowProps) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm text-slate-700">{value}</p>
    </div>
  );
}
