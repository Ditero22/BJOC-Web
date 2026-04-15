import { useState } from "react";
import { X } from "lucide-react";
import { useGlobalModal } from "@/features/shared/context/GlobalModalContext";
import {
  sendVerificationCode,
  verifyVerificationCode,
} from "@/features/shared/services/verificationService";

type VerificationMethod = "email" | "phone";

type VerifyAccountModalData = {
  email?: string;
  phone?: string;
  onVerified: () => void;
};

function isVerifyAccountModalData(value: unknown): value is VerifyAccountModalData {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "onVerified" in value;
}

export default function GlobalModalRenderer() {
  const { modal, closeModal } = useGlobalModal();

  const [method, setMethod] = useState<VerificationMethod>("email");
  const [code, setCode] = useState("");

  if (!modal.open || modal.type !== "verifyAccount") {
    return null;
  }

  if (!isVerifyAccountModalData(modal.data)) {
    return null;
  }

  const verificationData = modal.data;

  async function handleSendCode() {
    const value =
      method === "email"
        ? verificationData.email
        : verificationData.phone;

    if (!value) {
      alert("No contact value is available for verification.");
      return;
    }

    try {
      await sendVerificationCode(method, value);
      alert("Verification code sent!");
    } catch {
      alert("Failed to send code");
    }
  }

  async function handleVerify() {
    const value =
      method === "email"
        ? verificationData.email
        : verificationData.phone;

    if (!value) {
      alert("No contact value is available for verification.");
      return;
    }

    try {
      const response = await verifyVerificationCode(
        method,
        value,
        code
      );

      if (!response.success) {
        alert("Invalid verification code");
        return;
      }

      verificationData.onVerified();
      closeModal();
    } catch {
      alert("Verification failed");
    }
  }

  const contactLabel =
    method === "email"
      ? verificationData.email
      : verificationData.phone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[420px] space-y-4 rounded-xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Verify Account
          </h2>

          <button onClick={closeModal}>
            <X />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setMethod("email")}
            className={`rounded border px-3 py-1 ${
              method === "email"
                ? "bg-orange-600 text-white"
                : ""
            }`}
          >
            Email
          </button>

          <button
            onClick={() => setMethod("phone")}
            className={`rounded border px-3 py-1 ${
              method === "phone"
                ? "bg-orange-600 text-white"
                : ""
            }`}
          >
            Phone
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Send code to: {contactLabel ?? "Unavailable"}
        </p>

        <button
          onClick={handleSendCode}
          className="w-full rounded border py-2"
        >
          Send Verification Code
        </button>

        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Enter verification code"
          className="w-full rounded border p-2"
        />

        <button
          onClick={handleVerify}
          className="w-full rounded bg-orange-600 py-2 text-white"
        >
          Verify
        </button>
      </div>
    </div>
  );
}
