import { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { phNow } from "@/lib/time";
import { tripsService } from "../services/tripsService";

type Trip = {
  id: string;
  scheduled_departure_time?: string | null;
  vehicle?: string;
};

type Props = {
  onClose: () => void;
  onSuccess: () => void;
  open: boolean;
  trip: Trip | null;
};

export function RescheduleTripModal({ open, trip, onClose, onSuccess }: Props) {
  if (!open || !trip) {
    return null;
  }

  return (
    <RescheduleTripModalContent
      key={`${trip.id}-${trip.scheduled_departure_time ?? "unscheduled"}`}
      onClose={onClose}
      onSuccess={onSuccess}
      trip={trip}
    />
  );
}

type ContentProps = {
  onClose: () => void;
  onSuccess: () => void;
  trip: Trip;
};

function RescheduleTripModalContent({ trip, onClose, onSuccess }: ContentProps) {
  const [time, setTime] = useState<Date | null>(() => {
    if (trip.scheduled_departure_time) {
      return new Date(trip.scheduled_departure_time);
    }

    return phNow();
  });

  async function handleSave() {
    if (!time) {
      return;
    }
    if (time < phNow()) {
      alert("New schedule must be later than current time.");
      return;
    }

    try {
      await tripsService.rescheduleTrip(trip.id, {
        scheduled_departure_time: time.toISOString(),
      });

      onSuccess();
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error) && typeof error.response?.data?.message === "string") {
        alert(error.response.data.message);
        return;
      }

      alert("Unable to reschedule the trip right now.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-slate-900">Reschedule Trip</h3>
          <p className="mt-1 text-sm text-slate-500">{trip.vehicle || "Vehicle"} departure time</p>
        </div>

        <DatePicker
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-sky-500"
          dateFormat="h:mm aa"
          maxTime={new Date(new Date().setHours(23, 59, 59, 999))}
          minTime={phNow()}
          onChange={(date: Date | null) => setTime(date)}
          selected={time}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={5}
        />

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
            onClick={() => void handleSave()}
            type="button"
          >
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
