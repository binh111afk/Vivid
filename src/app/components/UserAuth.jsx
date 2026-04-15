import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, ShieldCheck } from "lucide-react";

import AuthForm, { useAuth } from "./AuthForm.jsx";

function buildFallbackAvatar(name = "Vivid User") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=800020&color=FFFDD0&bold=true`;
}

export default function UserAuth() {
  const { user, isLoggedIn, isLoading, logout } = useAuth();
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
      <div className="flex items-center gap-3 rounded-full border border-[rgba(128,0,32,0.14)] bg-[rgba(255,253,208,0.42)] px-4 py-2 text-sm text-[#800020] shadow-[0_18px_45px_rgba(128,0,32,0.12)] backdrop-blur-xl">
        <div className="h-3 w-3 animate-pulse rounded-full bg-[var(--tet-gold)]" />
        <span>Đang tải...</span>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[rgba(255,253,208,0.24)] bg-[rgba(128,0,32,0.9)] px-4 py-2.5 text-sm font-semibold text-[#FFFDD0] shadow-[0_18px_45px_rgba(128,0,32,0.22)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5"
        >
          Đăng nhập
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[20rem]">
            <AuthForm onSuccess={() => setIsMenuOpen(false)} />
          </div>
        )}
      </div>
    );
  }

  const avatarUrl = buildFallbackAvatar(user.displayName || user.username || "V");

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsMenuOpen((open) => !open)}
        className="flex items-center gap-2 rounded-full border border-[rgba(255,253,208,0.24)] bg-[rgba(255,253,208,0.18)] px-2 py-2 text-left shadow-[0_18px_45px_rgba(128,0,32,0.18)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5"
      >
        <img
          src={avatarUrl}
          alt={user.displayName ?? user.username ?? "User avatar"}
          className="h-10 w-10 rounded-full border-2 border-[var(--tet-gold)] object-cover"
        />
        <ChevronDown
          className={`h-4 w-4 text-[#800020] transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[18rem] overflow-hidden rounded-[1.75rem] border border-[rgba(128,0,32,0.14)] bg-[rgba(255,253,208,0.94)] p-3 shadow-[0_24px_50px_rgba(54,24,18,0.18)] backdrop-blur-2xl">
          <div className="rounded-[1.4rem] border border-[rgba(128,0,32,0.08)] bg-[rgba(255,255,255,0.4)] p-4">
            <div className="flex items-center gap-3">
              <img
                src={avatarUrl}
                alt={user.displayName ?? user.username ?? "User avatar"}
                className="h-14 w-14 rounded-full border-2 border-[var(--tet-gold)] object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-[#800020]">
                  {user.displayName || user.username}
                </p>
                <p className="mt-1 text-xs text-[rgba(54,24,18,0.68)]">
                  Phiên làm việc được lưu cục bộ trên thiết bị này
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[rgba(128,0,32,0.07)] px-3 py-3">
              <div className="mb-2 flex items-center gap-2 text-[#800020]">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-semibold">Quản lý tài khoản</span>
              </div>
              <p className="text-xs leading-relaxed text-[rgba(54,24,18,0.72)]">
                Bạn đang sử dụng đăng nhập thủ công với tài khoản Vivid. Dữ liệu phiên sẽ được giữ lại bằng localStorage để bạn không phải đăng nhập lại sau mỗi lần tải trang.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              setIsMenuOpen(false);
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#800020] px-3 py-3 text-sm font-medium text-[#FFFDD0] transition-colors hover:bg-[#68001a]"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
