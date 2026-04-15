import {
  useState,
  type ChangeEvent,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Eye, EyeOff, X } from "lucide-react";

type DriverForm = {
  confirm_password: string;
  contact_number: string;
  email: string;
  first_name: string;
  last_name: string;
  license_number: string;
  password: string;
  status: string;
};

type Props = {
  form: DriverForm;
  onClose: () => void;
  onSave: () => Promise<void> | void;
  open: boolean;
  setForm: Dispatch<SetStateAction<DriverForm>>;
};

export function DriverModal({ open, form, setForm, onSave, onClose }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return null;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSubmitError("");
    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  }

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!form.first_name) {
      nextErrors.first_name = "First name is required";
    }
    if (!form.last_name) {
      nextErrors.last_name = "Last name is required";
    }
    if (!form.email) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = "Invalid email format";
    }
    if (!form.contact_number) {
      nextErrors.contact_number = "Contact number required";
    }
    if (!form.license_number) {
      nextErrors.license_number = "License number required";
    }
    if (!form.password) {
      nextErrors.password = "Password required";
    }
    if (form.password !== form.confirm_password) {
      nextErrors.confirm_password = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleConfirm() {
    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");
      await onSave();
    } catch (error: any) {
      setSubmitError(error?.response?.data?.message || error?.message || "Failed to save driver.");
    } finally {
      setSubmitting(false);
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
            <h2 className="text-xl font-semibold text-slate-900">Driver Details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a driver profile and assign secure login credentials.
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

        {submitError && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField error={errors.first_name} label="First name">
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500"
              name="first_name"
              onChange={handleChange}
              placeholder="First name"
              value={form.first_name}
            />
          </InputField>

          <InputField error={errors.last_name} label="Last name">
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500"
              name="last_name"
              onChange={handleChange}
              placeholder="Last name"
              value={form.last_name}
            />
          </InputField>

          <InputField className="sm:col-span-2" error={errors.email} label="Email">
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500"
              name="email"
              onChange={handleChange}
              placeholder="Email address"
              value={form.email}
            />
          </InputField>

          <InputField error={errors.contact_number} label="Contact number">
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500"
              name="contact_number"
              onChange={handleChange}
              placeholder="Contact number"
              value={form.contact_number}
            />
          </InputField>

          <InputField error={errors.license_number} label="License number">
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500"
              name="license_number"
              onChange={handleChange}
              placeholder="License number"
              value={form.license_number}
            />
          </InputField>

          <PasswordField
            error={errors.password}
            label="Password"
            onChange={handleChange}
            onToggle={() => setShowPassword((previous) => !previous)}
            placeholder="Password"
            show={showPassword}
            value={form.password}
            name="password"
          />

          <PasswordField
            error={errors.confirm_password}
            label="Confirm password"
            onChange={handleChange}
            onToggle={() => setShowConfirm((previous) => !previous)}
            placeholder="Confirm password"
            show={showConfirm}
            value={form.confirm_password}
            name="confirm_password"
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
            className="rounded-2xl bg-amber-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={submitting}
            onClick={handleConfirm}
            type="button"
          >
            {submitting ? "Saving..." : "Confirm Details"}
          </button>
        </div>
      </div>
    </div>
  );
}

type InputFieldProps = {
  children: ReactNode;
  className?: string;
  error?: string;
  label: string;
};

function InputField({ children, className = "", error, label }: InputFieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>
      {children}
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </label>
  );
}

type PasswordFieldProps = {
  error?: string;
  label: string;
  name: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onToggle: () => void;
  placeholder: string;
  show: boolean;
  value: string;
};

function PasswordField({
  error,
  label,
  name,
  onChange,
  onToggle,
  placeholder,
  show,
  value,
}: PasswordFieldProps) {
  return (
    <InputField error={error} label={label}>
      <div className="relative">
        <input
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-11 text-sm outline-none transition focus:border-amber-500"
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          type={show ? "text" : "password"}
          value={value}
        />
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
          onClick={onToggle}
          type="button"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </InputField>
  );
}
