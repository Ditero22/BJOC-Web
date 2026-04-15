import {
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { X } from "lucide-react";

type VehicleForm = {
  capacity: number;
  model: string;
  plate_number: string;
};

type Props = {
  form: VehicleForm;
  onClose: () => void;
  onSave: () => void;
  open: boolean;
  setForm: Dispatch<SetStateAction<VehicleForm>>;
};

export function VehicleModal({ open, form, setForm, onSave, onClose }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) {
    return null;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "capacity"
          ? Number(value)
          : name === "plate_number"
          ? value.toUpperCase()
          : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  }

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!form.plate_number) {
      nextErrors.plate_number = "Plate number required";
    }
    if (!form.model) {
      nextErrors.model = "Vehicle model required";
    }
    if (!form.capacity || form.capacity <= 0) {
      nextErrors.capacity = "Capacity must be greater than 0";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) {
      return;
    }

    onSave();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[28px] bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Vehicle Details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a vehicle record and its capacity information.
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

        <div className="space-y-4">
          <ModalInput
            error={errors.plate_number}
            label="Plate number"
            name="plate_number"
            onChange={handleChange}
            placeholder="Plate number"
            value={form.plate_number}
          />
          <ModalInput
            error={errors.model}
            label="Vehicle model"
            name="model"
            onChange={handleChange}
            placeholder="Vehicle model"
            value={form.model}
          />
          <ModalInput
            error={errors.capacity}
            label="Passenger capacity"
            name="capacity"
            onChange={handleChange}
            placeholder="Passenger capacity"
            type="number"
            value={String(form.capacity)}
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-2xl bg-emerald-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-900"
            onClick={handleSave}
            type="button"
          >
            Save Vehicle
          </button>
        </div>
      </div>
    </div>
  );
}

type ModalInputProps = {
  error?: string;
  label: string;
  name: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  value: string;
};

function ModalInput({
  error,
  label,
  name,
  onChange,
  placeholder,
  type = "text",
  value,
}: ModalInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>
      <input
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </label>
  );
}
