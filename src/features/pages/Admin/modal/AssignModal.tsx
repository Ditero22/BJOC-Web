import { X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import type { Driver, Vehicle } from "@/features";

type AssignForm = {
  driver_id: string;
  vehicle_id: string;
};

type Props = {
  drivers: Driver[];
  form: AssignForm;
  mode: "driver" | "vehicle" | null;
  onAssign: () => void;
  onClose: () => void;
  open: boolean;
  setForm: Dispatch<SetStateAction<AssignForm>>;
  vehicles: Vehicle[];
};

export function AssignModal({
  open,
  drivers,
  vehicles,
  mode,
  form,
  setForm,
  onAssign,
  onClose,
}: Props) {
  if (!open) {
    return null;
  }

  const title = mode === "driver" ? "Assign Vehicle" : "Assign Driver";
  const helperText =
    mode === "driver"
      ? "Choose a vehicle for the selected driver."
      : "Choose a driver for the selected vehicle.";

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
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{helperText}</p>
          </div>

          <button
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {mode === "driver" && (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Vehicle</span>
            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-sky-500"
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  vehicle_id: event.target.value,
                }))
              }
              value={form.vehicle_id}
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate_number} - {vehicle.model}
                </option>
              ))}
            </select>
          </label>
        )}

        {mode === "vehicle" && (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Driver</span>
            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-sky-500"
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  driver_id: event.target.value,
                }))
              }
              value={form.driver_id}
            >
              <option value="">Select Driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.first_name} {driver.last_name}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700"
            onClick={onAssign}
            type="button"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
