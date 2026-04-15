import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LogOut, ShieldCheck } from "lucide-react";

const AuthContext = createContext({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  refreshAuth: async () => {},
});

function extractAvatarUrl(clientPrincipal) {
  const claims = clientPrincipal?.claims ?? [];
  const avatarClaim = claims.find((claim) =>
    ["picture", "avatar_url", "photo", "image"].includes(claim.typ),
  );

  return avatarClaim?.val ?? null;
}

function buildFallbackAvatar(name = "Vivid User") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=A12D3A&color=F8EFE3&bold=true`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/.auth/me", {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const payload = await response.json();
      const clientPrincipal = payload?.clientPrincipal ?? null;

      if (!clientPrincipal) {
        setUser(null);
        return;
      }

      setUser({
        ...clientPrincipal,
        avatarUrl:
          extractAvatarUrl(clientPrincipal) ??
          buildFallbackAvatar(clientPrincipal.userDetails ?? "Vivid User"),
      });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      isLoading,
      refreshAuth,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export default function UserAuth() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-[rgba(161,45,58,0.15)] bg-[rgba(248,239,227,0.58)] px-4 py-2 text-sm text-[var(--tet-red)] shadow-[0_18px_45px_rgba(126,34,48,0.12)] backdrop-blur-xl">
        <div className="h-3 w-3 animate-pulse rounded-full bg-[var(--tet-gold)]" />
        <span>Đang tải...</span>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <a
        href="/.auth/login/google"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[rgba(248,239,227,0.24)] bg-[rgba(161,45,58,0.86)] px-4 py-2.5 text-sm font-semibold text-[var(--tet-cream)] shadow-[0_18px_45px_rgba(126,34,48,0.22)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[rgba(161,45,58,0.94)]"
      >
        Đăng nhập
      </a>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsMenuOpen((open) => !open)}
        className="flex items-center gap-2 rounded-full border border-[rgba(248,239,227,0.24)] bg-[rgba(248,239,227,0.18)] px-2 py-2 text-left shadow-[0_18px_45px_rgba(126,34,48,0.18)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5"
      >
        <img
          src={user.avatarUrl}
          alt={user.userDetails ?? "User avatar"}
          className="h-10 w-10 rounded-full border-2 border-[var(--tet-gold)] object-cover"
        />
        <ChevronDown
          className={`h-4 w-4 text-[var(--tet-red)] transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[18rem] overflow-hidden rounded-[1.75rem] border border-[rgba(161,45,58,0.14)] bg-[rgba(248,239,227,0.94)] p-3 shadow-[0_24px_50px_rgba(47,23,21,0.18)] backdrop-blur-2xl">
          <div className="rounded-[1.4rem] border border-[rgba(161,45,58,0.08)] bg-[rgba(255,255,255,0.4)] p-4">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl}
                alt={user.userDetails ?? "User avatar"}
                className="h-14 w-14 rounded-full border-2 border-[var(--tet-gold)] object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-[var(--tet-red)]">
                  {user.userDetails}
                </p>
                <p className="mt-1 text-xs text-[rgba(47,23,21,0.68)]">
                  Đã đăng nhập với {user.identityProvider}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[rgba(161,45,58,0.07)] px-3 py-3">
              <div className="mb-2 flex items-center gap-2 text-[var(--tet-red)]">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-semibold">Quản lý tài khoản</span>
              </div>
              <p className="text-xs leading-relaxed text-[rgba(47,23,21,0.72)]">
                Bạn đang dùng Easy Auth của Azure Static Web Apps. Từ đây bạn có thể kiểm soát trạng thái đăng nhập của tài khoản Google.
              </p>
            </div>
          </div>

          <a
            href="/.auth/logout?post_logout_redirect_uri=/"
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-[rgba(161,45,58,0.92)] px-3 py-3 text-sm font-medium text-[var(--tet-cream)] transition-colors hover:bg-[rgba(161,45,58,0.98)]"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </a>
        </div>
      )}
    </div>
  );
}
