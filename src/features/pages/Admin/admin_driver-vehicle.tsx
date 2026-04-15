import { useEffect, useState } from "react";
import { X } from "lucide-react";
import SharedMap from "@/features/shared/components/layout/SharedMap";
import type { MapVehicle } from "@/features/types/operations";

import { driverService } from "./services/driverService";
import { vehicleService } from "./services/vehicleService";
import { DriverCard, VehicleCard } from "@/features";
import { AssignModal, ConfirmModal, DriverModal, VehicleModal } from "./modal";

export type Driver = {
  contact_number: string;
  email: string;
  first_name: string;
  id: string;
  last_name: string;
  license_number: string;
  status: string;
};

export type Vehicle = {
  capacity: number;
  driver_id?: string | null;
  id: string;
  model: string;
  plate_number: string;
  status: string;
};

export function AdminDriverVehicleOversight() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleLocations, setVehicleLocations] = useState<MapVehicle[]>([]);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [assignMode, setAssignMode] = useState<"driver" | "vehicle" | null>(null);
  const [assignForm, setAssignForm] = useState({
    driver_id: "",
    vehicle_id: "",
  });
  const [driverForm, setDriverForm] = useState({
    confirm_password: "",
    contact_number: "",
    email: "",
    first_name: "",
    last_name: "",
    license_number: "",
    password: "",
    status: "offline",
  });
  const [vehicleForm, setVehicleForm] = useState({
    capacity: 16,
    model: "",
    plate_number: "",
  });
  const [confirmModal, setConfirmModal] = useState({
    action: () => {},
    message: "",
    open: false,
    title: "",
  });

  const defaultCenter = {
    latitude: 14.41263339062224,
    longitude: 120.95675506640023,
  };

  async function loadDrivers() {
    const data = await driverService.getDrivers();
    setDrivers(data ?? []);
  }

  async function loadVehicles() {
    const data = await vehicleService.getVehicles();
    setVehicles(data ?? []);
  }

  async function loadVehicleLocations() {
    const data = await vehicleService.getVehicleLocations();
    setVehicleLocations(data ?? []);
  }

  useEffect(() => {
    void loadDrivers();
    void loadVehicles();
    void loadVehicleLocations();

    const interval = window.setInterval(() => {
      void loadVehicleLocations();
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  function confirm(title: string, message: string, action: () => void) {
    setConfirmModal({
      action,
      message,
      open: true,
      title,
    });
  }

  function deleteDriver(id: string) {
    confirm("Delete Driver", "Are you sure you want to delete this driver?", async () => {
      await driverService.deleteDriver(id);
      void loadDrivers();
    });
  }

  function deleteVehicle(id: string) {
    confirm("Delete Vehicle", "Are you sure you want to delete this vehicle?", async () => {
      await vehicleService.deleteVehicle(id);
      void loadVehicles();
    });
  }

  async function saveDriver() {
    if (editingDriver) {
      await driverService.updateDriver(editingDriver.id, driverForm);
    } else {
      await driverService.createDriver(driverForm);
    }

    setShowDriverModal(false);
    setEditingDriver(null);
    void loadDrivers();
  }

  async function saveVehicle() {
    if (editingVehicle) {
      await vehicleService.updateVehicle(editingVehicle.id, vehicleForm);
    } else {
      await vehicleService.createVehicle(vehicleForm);
    }

    setShowVehicleModal(false);
    setEditingVehicle(null);
    void loadVehicles();
  }

  async function assignDriver() {
    await vehicleService.updateVehicle(assignForm.vehicle_id, {
      driver_id: assignForm.driver_id,
    });

    setAssignForm({ driver_id: "", vehicle_id: "" });
    setShowAssignModal(false);
    void loadVehicles();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700/60">
              Fleet Control
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Driver & Vehicle Oversight
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Manage assignments, keep driver and vehicle data current, and watch fleet movement in a
              layout that adapts from mobile to desktop.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <PanelStat label="Drivers" value={drivers.length} />
            <PanelStat label="Vehicles" value={vehicles.length} />
            <PanelStat label="Tracked units" value={vehicleLocations.length} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(320px,0.8fr)]">
        <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Drivers</h2>
              <p className="text-sm text-slate-500">Update profiles and assign available vehicles.</p>
            </div>

            <button
              className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
              onClick={() => {
                setEditingDriver(null);
                setDriverForm({
                  confirm_password: "",
                  contact_number: "",
                  email: "",
                  first_name: "",
                  last_name: "",
                  license_number: "",
                  password: "",
                  status: "offline",
                });
                setShowDriverModal(true);
              }}
              type="button"
            >
              Add Driver
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {drivers.map((driver) => (
              <DriverCard
                key={driver.id}
                driver={driver}
                onAssign={() => {
                  setAssignMode("driver");
                  setAssignForm({ driver_id: driver.id, vehicle_id: "" });
                  setShowAssignModal(true);
                }}
                onDelete={() => deleteDriver(driver.id)}
                onEdit={() => {
                  setEditingDriver(driver);
                  setDriverForm({
                    confirm_password: "",
                    contact_number: driver.contact_number,
                    email: driver.email,
                    first_name: driver.first_name,
                    last_name: driver.last_name,
                    license_number: driver.license_number,
                    password: "",
                    status: driver.status,
                  });
                  setShowDriverModal(true);
                }}
                vehicles={vehicles}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Vehicles</h2>
              <p className="text-sm text-slate-500">Keep fleet records accurate and assignment-ready.</p>
            </div>

            <button
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              onClick={() => {
                setEditingVehicle(null);
                setVehicleForm({
                  capacity: 16,
                  model: "",
                  plate_number: "",
                });
                setShowVehicleModal(true);
              }}
              type="button"
            >
              Add Vehicle
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                drivers={drivers}
                onAssign={() => {
                  setAssignMode("vehicle");
                  setAssignForm({ driver_id: "", vehicle_id: vehicle.id });
                  setShowAssignModal(true);
                }}
                onDelete={() => deleteVehicle(vehicle.id)}
                onEdit={() => {
                  setEditingVehicle(vehicle);
                  setVehicleForm({
                    capacity: vehicle.capacity,
                    model: vehicle.model,
                    plate_number: vehicle.plate_number,
                  });
                  setShowVehicleModal(true);
                }}
                vehicle={vehicle}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Fleet Map</h2>
              <p className="text-sm text-slate-500">Live location preview of tracked vehicles.</p>
            </div>

            <button
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-900"
              onClick={() => setShowMapModal(true)}
              type="button"
            >
              Expand Map
            </button>
          </div>

          <div
            className="relative h-[280px] overflow-hidden rounded-[22px] border border-slate-100 bg-slate-50 sm:h-[340px]"
            onClick={() => setShowMapModal(true)}
          >
            <SharedMap
              initialCenter={defaultCenter}
              initialZoom={11}
              vehicles={vehicleLocations}
            />

            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-slate-950/70 px-4 py-3 text-sm text-white backdrop-blur">
              Tap to view the full fleet map.
            </div>
          </div>
        </section>
      </div>

      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex h-[min(90vh,820px)] w-full max-w-6xl flex-col rounded-[28px] bg-white p-4 shadow-2xl sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Fleet Map</h2>
                <p className="text-sm text-slate-500">Expanded live view of current fleet locations.</p>
              </div>

              <button
                className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                onClick={() => setShowMapModal(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden rounded-[22px] border border-slate-100">
              <SharedMap
                bearing={100}
                initialCenter={defaultCenter}
                initialZoom={12}
                vehicles={vehicleLocations}
              />
            </div>
          </div>
        </div>
      )}

      <DriverModal
        form={driverForm}
        onClose={() => setShowDriverModal(false)}
        onSave={saveDriver}
        open={showDriverModal}
        setForm={setDriverForm}
      />

      <VehicleModal
        form={vehicleForm}
        onClose={() => setShowVehicleModal(false)}
        onSave={saveVehicle}
        open={showVehicleModal}
        setForm={setVehicleForm}
      />

      <AssignModal
        drivers={drivers}
        form={assignForm}
        mode={assignMode}
        onAssign={assignDriver}
        onClose={() => setShowAssignModal(false)}
        open={showAssignModal}
        setForm={setAssignForm}
        vehicles={vehicles}
      />

      <ConfirmModal modal={confirmModal} setModal={setConfirmModal} />
    </div>
  );
}

type PanelStatProps = {
  label: string;
  value: number;
};

function PanelStat({ label, value }: PanelStatProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
