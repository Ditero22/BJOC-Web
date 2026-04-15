import { X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

type Modal = {
  action: () => void;
  message: string;
  open: boolean;
  title: string;
};

type Props = {
  modal: Modal;
  setModal: Dispatch<SetStateAction<Modal>>;
};

export function ConfirmModal({ modal, setModal }: Props) {
  if (!modal.open) {
    return null;
  }

  function closeModal() {
    setModal((previous) => ({ ...previous, open: false }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{modal.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{modal.message}</p>
          </div>

          <button
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            onClick={closeModal}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={closeModal}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700"
            onClick={() => {
              modal.action();
              closeModal();
            }}
            type="button"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
