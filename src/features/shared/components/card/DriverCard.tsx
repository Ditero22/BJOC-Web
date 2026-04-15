import { Car, Pencil, Trash2 } from "lucide-react";
import type { Driver, Vehicle } from "@/features";

type Props = {
  driver: Driver;
  vehicles: Vehicle[];
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
};

export function DriverCard({
  driver,
  vehicles,
  onEdit,
  onDelete,
  onAssign
}: Props) {

  const vehicle = vehicles.find(v => v.driver_id === driver.id);

  return (

    <div className="bg-white border rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition">

      <div className="flex items-center justify-between">

        {/* DRIVER INFO */}

        <div className="min-w-0">

          <div className="flex items-center gap-2">

            <span className="font-medium text-gray-800 truncate">
              {driver.first_name} {driver.last_name}
            </span>

            <span
              className={`text-[10px] px-1.5 py-[1px] rounded ${
                driver.status === "driving"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {driver.status}
            </span>

          </div>

          <div className="text-[11px] text-gray-500 truncate">

            {driver.license_number} • {vehicle ? vehicle.plate_number : "No vehicle"}

          </div>

        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-1 ml-2">

          <button
            onClick={onAssign}
            className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
          >
            <Car size={14} />
          </button>

          <button
            onClick={onEdit}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
          >
            <Pencil size={14} />
          </button>

          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-50 text-red-600"
          >
            <Trash2 size={14} />
          </button>

        </div>

      </div>

    </div>
  );
}