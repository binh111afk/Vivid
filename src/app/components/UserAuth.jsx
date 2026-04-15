import { ChevronRight } from "lucide-react";

import { useAuth } from "./AuthPage.jsx";

function buildFallbackAvatar(name = "Vivid User") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=800020&color=FFFDD0&bold=true`;
}

export default function UserAuth({ onOpenAccount = () => {} }) {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-[rgba(128,0,32,0.14)] bg-[rgba(255,253,208,0.42)] px-4 py-2 text-sm text-[#800020] shadow-[0_18px_45px_rgba(128,0,32,0.12)] backdrop-blur-xl">
        <div className="h-3 w-3 animate-pulse rounded-full bg-[var(--tet-gold)]" />
        <span>Đang tải...</span>
      </div>
    );
  }

  const avatarUrl = user.avatar || buildFallbackAvatar(user.displayName || user.username || "V");

  return (
    <button
      type="button"
      onClick={onOpenAccount}
      className="group flex items-center gap-2 rounded-full border border-[rgba(255,253,208,0.24)] bg-[rgba(255,253,208,0.18)] px-2 py-2 text-left shadow-[0_18px_45px_rgba(128,0,32,0.18)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5"
    >
      <img
        src={avatarUrl}
        alt={user.displayName ?? user.username ?? "User avatar"}
        className="h-10 w-10 rounded-full border-2 border-[var(--tet-gold)] object-cover"
      />
      <ChevronRight className="h-4 w-4 text-[#800020] transition-transform duration-200 group-hover:translate-x-0.5" />
    </button>
  );
}
