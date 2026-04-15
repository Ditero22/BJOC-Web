import { Pencil, Trash2, UserPlus } from "lucide-react";
import type { Driver, Vehicle } from "@/features";

type Props = {
  vehicle: Vehicle;
  drivers: Driver[];
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
};

export function VehicleCard({
  vehicle,
  drivers,
  onEdit,
  onDelete,
  onAssign
}: Props) {

  const driver = drivers.find(d => d.id === vehicle.driver_id);

  return (

    <div className="bg-white border rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition">

      <div className="flex items-center justify-between">

        <div className="min-w-0">

          <div className="flex items-center gap-2">

            <span className="font-medium text-gray-800 truncate">
              {vehicle.plate_number}
            </span>

            <span
              className={`text-[10px] px-1.5 py-[1px] rounded ${
                driver
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {driver ? "assigned" : "available"}
            </span>

          </div>

          <div className="text-[11px] text-gray-500 truncate">

            {vehicle.model} • {vehicle.capacity} seats •{" "}
            {driver ? `${driver.first_name}` : "no driver"}

          </div>

        </div>


        <div className="flex items-center gap-1 ml-2">

          <button
            onClick={onAssign}
            className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
          >
            <UserPlus size={14} />
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