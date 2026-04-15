import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LoaderCircle, LogIn, UserPlus } from "lucide-react";

const STORAGE_KEY = "vivid:user";

const AuthContext = createContext({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function persistUser(user) {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = readStoredUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const login = async ({ username, password }) => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Đăng nhập thất bại.");
    }

    persistUser(payload.user);
    setUser(payload.user);
    return payload.user;
  };

  const register = async ({ username, password }) => {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Đăng ký thất bại.");
    }

    persistUser(payload.user);
    setUser(payload.user);
    return payload.user;
  };

  const logout = () => {
    persistUser(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthForm({ defaultMode = "login", onSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(defaultMode);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoginMode = mode === "login";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await login(formData);
      } else {
        await register(formData);
      }

      onSuccess?.();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-[rgba(255,253,208,0.24)] bg-[rgba(255,253,208,0.16)] p-5 shadow-[0_24px_60px_rgba(128,0,32,0.22)] backdrop-blur-2xl">
      <div className="mb-5 flex rounded-full bg-[rgba(128,0,32,0.08)] p-1">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
          }}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            isLoginMode
              ? "bg-[#800020] text-[#FFFDD0] shadow-[0_10px_25px_rgba(128,0,32,0.22)]"
              : "text-[#800020]"
          }`}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError("");
          }}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            !isLoginMode
              ? "bg-[#800020] text-[#FFFDD0] shadow-[0_10px_25px_rgba(128,0,32,0.22)]"
              : "text-[#800020]"
          }`}
        >
          Đăng ký
        </button>
      </div>

      <div className="mb-5">
        <h2 className="text-xl font-semibold text-[#800020]">
          {isLoginMode ? "Chào mừng quay lại" : "Tạo tài khoản Vivid"}
        </h2>
        <p className="mt-2 text-sm text-[rgba(54,24,18,0.72)]">
          {isLoginMode
            ? "Đăng nhập để tiếp tục lưu giữ những khoảnh khắc thân thương."
            : "Tạo tài khoản mới để bắt đầu chia sẻ ảnh cùng gia đình."}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#800020]">Tên đăng nhập</span>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            placeholder="Nhập username"
            className="w-full rounded-2xl border border-[rgba(128,0,32,0.18)] bg-[rgba(255,253,208,0.58)] px-4 py-3 text-[#361812] placeholder:text-[rgba(54,24,18,0.42)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] outline-none backdrop-blur-xl transition-all focus:border-[#800020] focus:ring-4 focus:ring-[rgba(128,0,32,0.12)]"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#800020]">Mật khẩu</span>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete={isLoginMode ? "current-password" : "new-password"}
            placeholder="Nhập mật khẩu"
            className="w-full rounded-2xl border border-[rgba(128,0,32,0.18)] bg-[rgba(255,253,208,0.58)] px-4 py-3 text-[#361812] placeholder:text-[rgba(54,24,18,0.42)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] outline-none backdrop-blur-xl transition-all focus:border-[#800020] focus:ring-4 focus:ring-[rgba(128,0,32,0.12)]"
            required
          />
        </label>

        {error && (
          <div className="rounded-2xl border border-[rgba(128,0,32,0.14)] bg-[rgba(128,0,32,0.08)] px-4 py-3 text-sm text-[#800020]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#800020] px-5 py-3 text-sm font-semibold text-[#FFFDD0] shadow-[0_18px_40px_rgba(128,0,32,0.24)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : isLoginMode ? (
            <>
              <LogIn className="h-4 w-4" />
              Đăng nhập
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Đăng ký
            </>
          )}
        </button>
      </form>
    </div>
  );
}
