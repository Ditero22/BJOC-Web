import { createContext, useContext, useState } from "react";

type LoadingContextType = {
  loading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {

  const [loading, setLoading] = useState(false);

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ loading, showLoading, hideLoading }}>
      {children}

      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[999]">

          {/* Moving circle spinner */}

          <div className="h-12 w-12 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>

        </div>
      )}

    </LoadingContext.Provider>
  );
}

export function useLoading() {

  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error("useLoading must be used inside LoadingProvider");
  }

  return context;
}