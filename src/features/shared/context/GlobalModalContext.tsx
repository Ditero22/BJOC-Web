import { createContext, useContext, useState, type ReactNode } from "react";

type ModalType =
  | "emailVerification"
  | "phoneVerification"
  | "verifyAccount"
  | "info";

type ModalState = {
  open: boolean;
  type: ModalType | null;
  data?: unknown;
};

type ModalContextType = {
  modal: ModalState;
  openModal: (type: ModalType, data?: unknown) => void;
  closeModal: () => void;
};

const GlobalModalContext = createContext<ModalContextType | null>(null);

export function GlobalModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>({
    open: false,
    type: null,
    data: null
  });

  function openModal(type: ModalType, data?: unknown) {
    setModal({
      open: true,
      type,
      data
    });
  }

  function closeModal() {
    setModal({
      open: false,
      type: null,
      data: null
    });
  }

  return (
    <GlobalModalContext.Provider
      value={{ modal, openModal, closeModal }}
    >
      {children}
    </GlobalModalContext.Provider>
  );
}

export function useGlobalModal() {
  const context = useContext(GlobalModalContext);

  if (!context) {
    throw new Error("useGlobalModal must be used inside GlobalModalProvider");
  }

  return context;
}
