import { useEffect, useRef, useState } from "react";
import { Camera, ChevronDown, ImagePlus, KeyRound, LogOut, Save, ShieldCheck, UserRound } from "lucide-react";

import AuthPage, { useAuth } from "./AuthPage.jsx";

function buildFallbackAvatar(name = "Vivid User") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=800020&color=FFFDD0&bold=true`;
}

export default function UserAuth() {
  const { user, isLoggedIn, isLoading, logout, updateProfile, changePassword } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    avatar: "",
  });
  const [pendingAvatar, setPendingAvatar] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileForm({
      displayName: user.displayName || user.username || "",
      avatar: user.avatar || "",
    });
    setPendingAvatar("");
  }, [user]);

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
            <AuthPage onSuccess={() => setIsMenuOpen(false)} />
          </div>
        )}
      </div>
    );
  }

  const avatarUrl = user.avatar || buildFallbackAvatar(user.displayName || user.username || "V");
  const previewAvatarUrl = pendingAvatar || profileForm.avatar || avatarUrl;

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setProfileForm((prev) => ({
        ...prev,
        avatar: result,
      }));
      setPendingAvatar(result);
      setProfileMessage("Ảnh đại diện mới đã được tải lên, nhớ bấm Lưu thay đổi.");
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileMessage("");
    setIsSavingProfile(true);

    try {
      await updateProfile({
        username: user.username,
        displayName: profileForm.displayName,
        avatar: profileForm.avatar,
      });
      setPendingAvatar("");
      setProfileMessage("Đã cập nhật hồ sơ thành công.");
    } catch (error) {
      setProfileMessage(error.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordMessage("");
    setIsChangingPassword(true);

    try {
      const response = await changePassword({
        username: user.username,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage(response.message || "Đổi mật khẩu thành công.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
      });
    } catch (error) {
      setPasswordMessage(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

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
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[23rem] overflow-hidden rounded-[1.9rem] border border-[rgba(128,0,32,0.14)] bg-[rgba(255,253,208,0.96)] p-3 shadow-[0_24px_50px_rgba(54,24,18,0.18)] backdrop-blur-2xl">
          <div className="space-y-3">
            <section className="rounded-[1.5rem] border border-[rgba(128,0,32,0.08)] bg-[rgba(255,255,255,0.4)] p-4">
              <div className="mb-4 flex items-center gap-2 text-[#800020]">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-semibold">Quản lý tài khoản</span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={previewAvatarUrl}
                  alt={user.displayName ?? user.username ?? "User avatar"}
                  className="h-16 w-16 rounded-full border-2 border-[var(--tet-gold)] object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-[#800020]">
                    {user.displayName || user.username}
                  </p>
                  <p className="mt-1 text-xs text-[rgba(54,24,18,0.68)]">@{user.username}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-[rgba(128,0,32,0.08)] bg-[rgba(255,255,255,0.45)] p-4">
              <div className="mb-3 flex items-center gap-2 text-[#800020]">
                <UserRound className="h-4 w-4" />
                <span className="text-sm font-semibold">Hồ sơ</span>
              </div>

              <form className="space-y-3" onSubmit={handleProfileSubmit}>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[var(--tet-gold)]"
                  >
                    <img src={previewAvatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-[rgba(54,24,18,0.32)] text-[#FFFDD0]">
                      <Camera className="h-4 w-4" />
                    </div>
                  </button>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(128,0,32,0.14)] bg-[rgba(128,0,32,0.08)] px-3 py-2 text-xs font-medium text-[#800020]"
                    >
                      <ImagePlus className="h-4 w-4" />
                      Tải ảnh đại diện
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <p className="mt-2 text-xs text-[rgba(54,24,18,0.62)]">
                      Chọn ảnh mới để cá nhân hóa tài khoản của bạn.
                    </p>
                  </div>
                </div>

                {pendingAvatar && (
                  <div className="rounded-[1.4rem] border border-[rgba(128,0,32,0.1)] bg-[rgba(255,253,208,0.5)] px-4 py-4">
                    <div className="mb-3 flex items-center gap-2 text-[#800020]">
                      <ImagePlus className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em]">Preview avatar</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="rounded-full border-4 border-[var(--tet-gold)] p-1 shadow-[0_18px_35px_rgba(128,0,32,0.14)]">
                        <img
                          src={pendingAvatar}
                          alt="Pending avatar preview"
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <p className="mt-3 text-center text-xs text-[rgba(54,24,18,0.68)]">
                      Avatar sẽ được hiển thị dưới dạng hình tròn sau khi bạn lưu thay đổi.
                    </p>
                  </div>
                )}

                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-[#800020]">Tên hiển thị</span>
                  <input
                    value={profileForm.displayName}
                    onChange={(event) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        displayName: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[rgba(128,0,32,0.18)] bg-[rgba(255,253,208,0.58)] px-4 py-3 text-sm text-[#361812] outline-none backdrop-blur-xl transition-all focus:border-[#800020] focus:ring-4 focus:ring-[rgba(128,0,32,0.12)]"
                  />
                </label>

                {profileMessage && (
                  <div className="rounded-2xl border border-[rgba(128,0,32,0.12)] bg-[rgba(128,0,32,0.08)] px-3 py-2 text-xs text-[#800020]">
                    {profileMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#800020] px-3 py-3 text-sm font-medium text-[#FFFDD0] transition-colors hover:bg-[#68001a] disabled:opacity-70"
                >
                  <Save className="h-4 w-4" />
                  {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </form>
            </section>

            <section className="rounded-[1.5rem] border border-[rgba(128,0,32,0.08)] bg-[rgba(255,255,255,0.45)] p-4">
              <div className="mb-3 flex items-center gap-2 text-[#800020]">
                <KeyRound className="h-4 w-4" />
                <span className="text-sm font-semibold">Bảo mật</span>
              </div>

              <form className="space-y-3" onSubmit={handlePasswordSubmit}>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-[#800020]">Mật khẩu hiện tại</span>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[rgba(128,0,32,0.18)] bg-[rgba(255,253,208,0.58)] px-4 py-3 text-sm text-[#361812] outline-none backdrop-blur-xl transition-all focus:border-[#800020] focus:ring-4 focus:ring-[rgba(128,0,32,0.12)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-[#800020]">Mật khẩu mới</span>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[rgba(128,0,32,0.18)] bg-[rgba(255,253,208,0.58)] px-4 py-3 text-sm text-[#361812] outline-none backdrop-blur-xl transition-all focus:border-[#800020] focus:ring-4 focus:ring-[rgba(128,0,32,0.12)]"
                  />
                </label>

                {passwordMessage && (
                  <div className="rounded-2xl border border-[rgba(128,0,32,0.12)] bg-[rgba(128,0,32,0.08)] px-3 py-2 text-xs text-[#800020]">
                    {passwordMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(128,0,32,0.18)] bg-[rgba(128,0,32,0.08)] px-3 py-3 text-sm font-medium text-[#800020] transition-colors hover:bg-[rgba(128,0,32,0.12)] disabled:opacity-70"
                >
                  <KeyRound className="h-4 w-4" />
                  {isChangingPassword ? "Đang đổi mật khẩu..." : "Đặt lại mật khẩu"}
                </button>
              </form>
            </section>

            <section className="rounded-[1.5rem] border border-[rgba(128,0,32,0.08)] bg-[rgba(255,255,255,0.45)] p-4">
              <div className="mb-3 flex items-center gap-2 text-[#800020]">
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-semibold">Phiên làm việc</span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-[rgba(54,24,18,0.72)]">
                Bạn đang đăng nhập trên thiết bị này. Dữ liệu hồ sơ sẽ được lưu lại cho những lần truy cập sau.
              </p>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#800020] px-3 py-3 text-sm font-medium text-[#FFFDD0] transition-colors hover:bg-[#68001a]"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
