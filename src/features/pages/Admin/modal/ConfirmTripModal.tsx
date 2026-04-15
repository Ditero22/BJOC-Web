import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { tripsService } from "../services/tripsService";

type TripSummary = {
  id: string;
  route?: string | null;
  vehicle?: string | null;
};

type Props = {
  action: "cancel" | "end" | "reschedule" | null;
  onClose: () => void;
  onSuccess: () => void;
  open: boolean;
  trip: TripSummary | null;
};

export function ConfirmTripModal({ open, trip, action, onClose, onSuccess }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [passengerCount, setPassengerCount] = useState("");

  if (!open || !trip || !action) {
    return null;
  }

  const currentTrip = trip;

  function handleClose() {
    setError(null);
    setPassengerCount("");
    onClose();
  }

  async function confirm() {
    setError(null);

    if (action === "cancel") {
      await tripsService.cancelTrip(currentTrip.id);
    }

    if (action === "end") {
      const normalizedPassengerCount = Number(passengerCount);

      if (!Number.isInteger(normalizedPassengerCount) || normalizedPassengerCount < 0) {
        setError("Enter a valid passenger count before ending the trip.");
        return;
      }

      await tripsService.endTrip(currentTrip.id, {
        passenger_count: normalizedPassengerCount,
      });
    }

    onSuccess();
    handleClose();
  }

  const actionText = action === "cancel"
    ? "Cancel this scheduled trip?"
    : "End this trip now and record the passenger count?";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start gap-3">
          <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Confirm Action</h3>
            <p className="mt-1 text-sm text-slate-500">{actionText}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
          <p>
            <span className="font-medium text-slate-500">Vehicle:</span> {trip.vehicle || "-"}
          </p>
          <p className="mt-2">
            <span className="font-medium text-slate-500">Route:</span> {currentTrip.route || "-"}
          </p>
        </div>

        {action === "end" && (
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="trip-passenger-count">
              Recorded passenger count
            </label>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              id="trip-passenger-count"
              inputMode="numeric"
              min={0}
              onChange={(event) => setPassengerCount(event.target.value)}
              placeholder="Enter total passengers served"
              step={1}
              type="number"
              value={passengerCount}
            />
            <p className="text-xs text-slate-500">
              This value is required by the backend to close the ongoing trip.
            </p>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={handleClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700"
            onClick={() => void confirm()}
            type="button"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
