import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, CalendarClock, TrendingUp, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { operatorService } from "./services/operatorService";
import type {
  OperatorActiveStop,
  OperatorFleetSummary,
  OperatorLoadStat,
  OperatorOverallSummary,
  OperatorStopStat,
} from "@/features/types/operations";

const COLORS = ["#14532d", "#0f766e", "#2563eb", "#f59e0b"];

const EMPTY_FLEET: OperatorFleetSummary = {
  active: 0,
  offline: 0,
  standby: 0,
  total: 0,
};

const EMPTY_OVERALL: OperatorOverallSummary = {
  avg_load: 0,
  passengers_today: 0,
  top_route: "-",
  trips_today: 0,
};

export function OperatorReportsPage() {
  const [fleetSummary, setFleetSummary] = useState<OperatorFleetSummary>(EMPTY_FLEET);
  const [stopStats, setStopStats] = useState<OperatorStopStat[]>([]);
  const [loadSummary, setLoadSummary] = useState<OperatorLoadStat[]>([]);
  const [activeStops, setActiveStops] = useState<OperatorActiveStop[]>([]);
  const [overall, setOverall] = useState<OperatorOverallSummary>(EMPTY_OVERALL);

  useEffect(() => {
    async function loadReports() {
      try {
        const [fleet, stops, loads, active, overallSummary] = await Promise.all([
          operatorService.getFleetSummary(),
          operatorService.getStopPopularity(),
          operatorService.getLoadSummary(),
          operatorService.getActiveStops(),
          operatorService.getOverallSummary(),
        ]);

        setFleetSummary(fleet ?? EMPTY_FLEET);
        setStopStats(stops ?? []);
        setLoadSummary(loads ?? []);
        setActiveStops(active ?? []);
        setOverall(overallSummary ?? EMPTY_OVERALL);
      } catch (error) {
        console.error("Operator reports load error:", error);
      }
    }

    void loadReports();
  }, []);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700/60">
              Staff Analytics
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Reports & Analytics
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Review fleet performance, route demand, and active stop pressure in a cleaner reporting
              layout for staff devices.
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Fleet total: <span className="font-semibold text-slate-900">{fleetSummary.total}</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ReportStat
            accentClass="bg-emerald-100 text-emerald-700"
            icon={<CalendarClock size={18} />}
            label="Trips Today"
            value={overall.trips_today}
          />
          <ReportStat
            accentClass="bg-sky-100 text-sky-700"
            icon={<Users size={18} />}
            label="Passengers Today"
            value={overall.passengers_today}
          />
          <ReportStat
            accentClass="bg-amber-100 text-amber-700"
            icon={<TrendingUp size={18} />}
            label="Average Load"
            value={`${overall.avg_load}%`}
          />
          <ReportStat
            accentClass="bg-violet-100 text-violet-700"
            icon={<BarChart3 size={18} />}
            label="Top Route"
            value={overall.top_route}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Load Trend">
          <div className="h-[260px] sm:h-[320px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={loadSummary}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar barSize={22} dataKey="load" fill="#14532d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Stop Demand Mix">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(220px,0.9fr)_minmax(0,1fr)]">
            <div className="mx-auto h-[240px] w-full max-w-[260px]">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    data={stopStats}
                    dataKey="percentage"
                    innerRadius={60}
                    nameKey="stop"
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {stopStats.map((stop, index) => (
                      <Cell key={`${stop.stop}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {stopStats.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
                  No stop data available.
                </div>
              ) : (
                stopStats.map((stop, index) => (
                  <div key={`${stop.stop}-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-700">{stop.stop}</span>
                      <span className="text-sm font-semibold text-slate-900">{stop.percentage}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                          width: `${Math.max(0, Math.min(100, stop.percentage))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Active Stops Snapshot</h2>
            <p className="text-sm text-slate-500">
              Current stop pressure to support staff dispatch decisions.
            </p>
          </div>

          {activeStops.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
              No active stop data available.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {activeStops.map((stop, index) => (
                <div
                  key={`${stop.stop}-${index}`}
                  className="flex items-center justify-between rounded-[22px] bg-slate-50 px-4 py-4"
                >
                  <span className="text-sm text-slate-700">{stop.stop}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-900 shadow-sm">
                    {stop.waiting}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Fleet Breakdown</h2>
            <p className="text-sm text-slate-500">Current operational readiness by vehicle state.</p>
          </div>

          <div className="space-y-3">
            <BreakdownRow label="Active Vehicles" value={fleetSummary.active} />
            <BreakdownRow label="Standby Vehicles" value={fleetSummary.standby} />
            <BreakdownRow label="Offline Vehicles" value={fleetSummary.offline} />
            <BreakdownRow label="Total Fleet" value={fleetSummary.total} />
          </div>
        </div>
      </section>
    </div>
  );
}

type ReportStatProps = {
  accentClass: string;
  icon: ReactNode;
  label: string;
  value: number | string;
};

function ReportStat({ accentClass, icon, label, value }: ReportStatProps) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 truncate text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`shrink-0 rounded-2xl p-3 ${accentClass}`}>{icon}</div>
      </div>
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
      <h2 className="mb-4 text-base font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

type BreakdownRowProps = {
  label: string;
  value: number;
};

function BreakdownRow({ label, value }: BreakdownRowProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-lg font-semibold text-slate-900">{value}</span>
    </div>
  );
}
