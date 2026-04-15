import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { X } from "lucide-react";

import { userService, type UserRole } from "../services/userService";

type Props = {
  onClose: () => void;
  refresh: () => void;
};

type CreateUserForm = {
  contact_number: string;
  email: string;
  first_name: string;
  last_name: string;
  license_number: string;
  middle_name: string;
  password: string;
  role: UserRole;
};

export function CreateUserModal({ onClose, refresh }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CreateUserForm>({
    contact_number: "",
    email: "",
    first_name: "",
    last_name: "",
    license_number: "",
    middle_name: "",
    password: "",
    role: "driver",
  });

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (form.role !== "driver") {
      setForm((previous) => ({ ...previous, license_number: "" }));
    }
  }, [form.role]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "role" ? (value as UserRole) : value,
    }));
    setError("");
  }

  async function handleSubmit() {
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      setError("First name, last name, email, and password are required.");
      return;
    }

    if (form.role === "driver" && !form.license_number) {
      setError("License number is required for drivers.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await userService.createUser(form);

      refresh();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Create User</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a new admin, operator, driver, or passenger account.
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

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name">
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              name="first_name"
              onChange={handleChange}
              placeholder="First name"
              value={form.first_name}
            />
          </Field>

          <Field label="Middle name">
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              name="middle_name"
              onChange={handleChange}
              placeholder="Middle name"
              value={form.middle_name}
            />
          </Field>

          <Field label="Last name">
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              name="last_name"
              onChange={handleChange}
              placeholder="Last name"
              value={form.last_name}
            />
          </Field>

          <Field label="Contact number">
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              name="contact_number"
              onChange={handleChange}
              placeholder="Contact number"
              type="tel"
              value={form.contact_number}
            />
          </Field>

          <Field className="sm:col-span-2" label="Email">
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              name="email"
              onChange={handleChange}
              placeholder="Email address"
              type="email"
              value={form.email}
            />
          </Field>

          <Field label="Role">
            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              name="role"
              onChange={handleChange}
              value={form.role}
            >
              <option value="driver">Driver</option>
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
              <option value="passenger">Passenger</option>
            </select>
          </Field>

          {form.role === "driver" && (
            <Field label="License number">
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                name="license_number"
                onChange={handleChange}
                placeholder="License number"
                value={form.license_number}
              />
            </Field>
          )}

          <Field className={form.role === "driver" ? "" : "sm:col-span-2"} label="Temporary password">
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              name="password"
              onChange={handleChange}
              placeholder="Temporary password"
              type="password"
              value={form.password}
            />
          </Field>
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
            className="rounded-2xl bg-emerald-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
            onClick={handleSubmit}
            type="button"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}

type FieldProps = {
  children: ReactNode;
  className?: string;
  label: string;
};

function Field({ children, className = "", label }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
