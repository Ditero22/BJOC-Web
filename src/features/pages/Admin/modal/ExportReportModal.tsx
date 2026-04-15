import { useMemo, useState } from "react";
import { Download, X } from "lucide-react";

import { exportCSV } from "@/features/shared/utils/reportExport";

type TripRow = {
  actual_end: string;
  actual_start: string;
  driver_name: string;
  id: string;
  plate_number: string;
  route_name: string;
  scheduled_start: string;
};

type PassengerRow = {
  passengers: number;
  route: string;
};

type DriverRow = {
  delayed: number;
  driver: string;
  onTime: number;
  trips: number;
};

type LogRow = {
  Action: string;
  Date: string;
  Description: string;
};

type Props = {
  drivers: DriverRow[];
  logs: LogRow[];
  onClose: () => void;
  open: boolean;
  passengers: PassengerRow[];
  reportWindowLabel: string;
  trips: TripRow[];
};

export default function ExportReportModal({
  open,
  onClose,
  trips,
  passengers,
  drivers,
  logs,
  reportWindowLabel,
}: Props) {
  const [type, setType] = useState("trips");

  const previewData = useMemo(() => {
    if (type === "passengers") {
      return passengers;
    }
    if (type === "drivers") {
      return drivers;
    }
    if (type === "logs") {
      return logs;
    }

    return trips;
  }, [drivers, logs, passengers, trips, type]);

  if (!open) {
    return null;
  }

  function handleExport() {
    exportCSV(`BJOC_${type}_report_${new Date().toISOString().slice(0, 10)}.csv`, previewData);
  }

  const headers = previewData.length > 0 ? Object.keys(previewData[0]) : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Export Report</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review a sample of the selected dataset before exporting.
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

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="block sm:min-w-[220px]">
            <span className="mb-2 block text-sm font-medium text-slate-600">Dataset</span>
            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              onChange={(event) => setType(event.target.value)}
              value={type}
            >
              <option value="trips">Trip History</option>
              <option value="passengers">Passenger Report</option>
              <option value="drivers">Driver Performance</option>
              <option value="logs">System Logs</option>
            </select>
          </label>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            <div>{previewData.length} row{previewData.length !== 1 ? "s" : ""} available</div>
            <div className="mt-1">Current window: {reportWindowLabel}</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-200">
          <div className="max-h-[420px] overflow-auto">
            {previewData.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-slate-400">
                No data available for this export.
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-emerald-950 text-left text-white">
                  <tr>
                    {headers.map((header) => (
                      <th key={header} className="px-4 py-3 font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 10).map((row, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      {Object.values(row).map((value, valueIndex) => (
                        <td key={valueIndex} className="px-4 py-3 text-slate-600">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-900"
            onClick={handleExport}
            type="button"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
