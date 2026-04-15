import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/features/shared/components";
import { usePageTitle } from "@/features/shared/hooks";
import { useAuthSession } from "../hooks/useAuthSession";
import { getDefaultPathForRole } from "../services/authRouting";
import { AuthSkeleton } from "./AuthSkeleton";

export function LoginPage() {
  usePageTitle("BJOC Login");

  const navigate = useNavigate();
  const { user, isBootstrapping, login } = useAuthSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!isBootstrapping && user) {
      navigate(getDefaultPathForRole(user.role), { replace: true });
    }
  }, [isBootstrapping, navigate, user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const authenticatedUser = await login(
        {
          email: formData.email.trim(),
          password: formData.password,
        },
        rememberMe,
      );

      navigate(getDefaultPathForRole(authenticatedUser.role), { replace: true });
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Login failed. Please check your credentials.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (isBootstrapping) {
    return <AuthSkeleton />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-6xl min-h-[620px] flex flex-col md:flex-row bg-white rounded-[30px] shadow-2xl overflow-hidden">
        <div className="relative w-full md:w-1/2 bg-gradient-to-br from-[#3EB076] to-[#104027] flex flex-col items-center justify-center text-white p-12">
          <div className="absolute top-0 right-0 h-full w-24 translate-x-1/2 hidden md:block">
            <svg viewBox="0 0 100 800" className="h-full w-full fill-white" preserveAspectRatio="none">
              <path d="M0,0 C40,60 40,120 0,180 C40,240 40,300 0,360 C40,420 40,480 0,540 C40,600 40,660 0,720 C40,780 40,800 0,800 L100,800 L100,0 Z" />
            </svg>
          </div>

          <div className="text-center space-y-6 z-10">
            <p className="text-xl opacity-90">Welcome to</p>

            <div className="flex flex-col items-center gap-3">
              <div className="bg-white rounded-full shadow-lg">
                <img src="/logo1.png" alt="BJOC logo" className="size-20 object-contain" />
              </div>

              <h1 className="text-5xl font-bold tracking-wide">BJOC</h1>
            </div>

            <div className="mt-10 text-sm md:text-base opacity-90 leading-relaxed">
              <p>Bicolano Jeepney Operators Corporation</p>
              <p>Real-Time Jeepney Tracking and Passenger Information System</p>
            </div>
          </div>

          <div className="absolute bottom-6 text-xs opacity-70">
            Developed by <span className="font-semibold">Karl Diether Ortega</span>
          </div>

          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 lg:px-20 py-12 relative">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-[#1F8450] mb-2">Log in</h2>
            <p className="text-gray-400 text-sm">Access the BJOC Management System</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
              className="w-full py-3 px-2 border-b border-gray-300 focus:border-orange-500 outline-none transition text-gray-700 bg-transparent placeholder-gray-400"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                className="w-full py-3 px-2 border-b border-gray-300 focus:border-orange-500 outline-none transition text-gray-700 bg-transparent placeholder-gray-400 pr-10"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-2 top-3 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="w-4 h-4 accent-[#1F8450]"
              />

              <label htmlFor="remember" className="text-sm text-[#1F8450] font-medium cursor-pointer">
                Remember Me
              </label>
            </div>

            <Button type="submit" disabled={loading} className="px-20">
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="mt-8 text-xs text-gray-400 italic">
            *Do not share your BJOC system credentials with anyone.
          </p>
        </div>
      </div>
    </div>
  );
}
