import type { FC } from "react";

type Vehicle = {
  id: string;
  plate_number: string;
  driver?: string | null;
  capacity?: number;
  trips_today?: number;
  scheduled?: boolean;
  ongoing?: boolean;
};

type Props = {
  vehicle: Vehicle;
  onDispatch: (vehicle: Vehicle) => void;
};

export const FleetVehicleCard: FC<Props> = ({ vehicle, onDispatch }) => {

  const status = vehicle.ongoing
    ? "ongoing"
    : vehicle.scheduled
    ? "scheduled"
    : "available";

  return (

    <div
      onClick={() => onDispatch(vehicle)}
      className="p-3 rounded-lg border transition w-full bg-white hover:shadow hover:border-gray-300 cursor-pointer"
    >

      <div className="flex justify-between items-center mb-2">

        <h3 className="text-sm font-semibold tracking-wide">
          {vehicle.plate_number}
        </h3>

        <span
          className={`text-[10px] px-2 py-[2px] rounded-full font-medium
          ${
            status === "ongoing"
              ? "bg-red-100 text-red-600"
              : status === "scheduled"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {status === "ongoing"
            ? "On Trip"
            : status === "scheduled"
            ? "Scheduled"
            : "Available"}
        </span>

      </div>

      <div className="text-[12px] text-gray-600 space-y-[2px]">

        <div className="flex justify-between">
          <span className="text-gray-500">Driver</span>
          <span className="font-medium text-gray-800 truncate max-w-[120px]">
            {vehicle.driver || "Unassigned"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Capacity</span>
          <span className="font-medium">
            {vehicle.capacity ?? "-"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Trips</span>
          <span className="font-medium">
            {vehicle.trips_today ?? 0}
          </span>
        </div>

      </div>

    </div>

  );

};