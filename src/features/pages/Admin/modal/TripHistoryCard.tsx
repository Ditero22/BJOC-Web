import { phTime } from "@/lib/time";

type Props = {
  trip: any;
};

export function TripHistoryCard({ trip }: Props) {

  const scheduled = trip.scheduled_departure_time
    ? new Date(trip.scheduled_departure_time)
    : null;

  const started = trip.start_time
    ? new Date(trip.start_time)
    : null;

  let delayText = "-";
  let delayColor = "text-gray-500";

  if (scheduled && started) {

    const diff = Math.round(
      (started.getTime() - scheduled.getTime()) / 60000
    );

    if (diff <= 0) {

      delayText = "On Time";
      delayColor = "text-green-600";

    } else {

      delayText = `+${diff} min late`;
      delayColor = "text-red-600";

    }

  }

  return (

    <div className="border rounded-lg p-3 bg-white shadow-sm flex justify-between items-center">
      <div>
        <div className="font-semibold text-sm">
          {trip.vehicle}
        </div>
        <div className="text-xs text-gray-600">
          Driver: {trip.driver || "Unknown"}
        </div>
        <div className="text-xs text-gray-600">
          Route: {trip.route}
        </div>
      </div>

      <div className="text-right text-xs space-y-[2px]">
        <div>
          Start: {trip.start_time ? phTime(trip.start_time) : "-"}
        </div>
        <div className="text-gray-500">
          End: {trip.end_time ? phTime(trip.end_time) : "-"}
        </div>
        <div className={`${delayColor} font-medium`}>
          {delayText}
        </div>
      </div>

    </div>

  );
}