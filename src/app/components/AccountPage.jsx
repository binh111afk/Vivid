import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, ImagePlus, KeyRound, LogOut, Save, ShieldCheck, UserRound } from "lucide-react";

import { useAuth } from "./AuthPage.jsx";

function buildFallbackAvatar(name = "Vivid User") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=800020&color=FFFDD0&bold=true`;
}

function SectionCard({ icon, title, description, children }) {
  return (
    <section className="rounded-[1.8rem] border border-[rgba(128,0,32,0.1)] bg-[rgba(255,255,255,0.5)] p-5 shadow-[0_18px_35px_rgba(128,0,32,0.08)] backdrop-blur-xl">
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl bg-[rgba(128,0,32,0.08)] p-2 text-[#800020]">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#800020]">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-[rgba(54,24,18,0.68)]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function AccountPage({ onBack = () => {} }) {
  const { user, updateProfile, changePassword, logout } = useAuth();
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
  const fileInputRef = useRef(null);

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

  if (!user) {
    return null;
  }

  const avatarUrl = user.avatar || buildFallbackAvatar(user.displayName || user.username || "V");
  const previewAvatarUrl = pendingAvatar || profileForm.avatar || avatarUrl;

  const handleAvatarChange = (event) => {
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
    <div className="h-full overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      <div className="pb-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(128,0,32,0.14)] bg-[rgba(255,253,208,0.56)] px-4 py-2 text-sm font-medium text-[#800020] shadow-[0_14px_28px_rgba(128,0,32,0.08)] backdrop-blur-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        <div className="rounded-[2rem] border border-[rgba(128,0,32,0.12)] bg-[rgba(255,253,208,0.5)] p-5 shadow-[0_22px_45px_rgba(128,0,32,0.1)] backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <img
              src={previewAvatarUrl}
              alt={user.displayName ?? user.username ?? "User avatar"}
              className="h-20 w-20 rounded-full border-[3px] border-[var(--tet-gold)] object-cover shadow-[0_18px_36px_rgba(128,0,32,0.12)]"
            />
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold text-[#800020]">{user.displayName || user.username}</p>
              <p className="mt-1 text-sm text-[rgba(54,24,18,0.7)]">@{user.username}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[rgba(128,0,32,0.72)]">
                Trung tam quan ly tai khoan
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pb-6">
        <SectionCard
          icon={<UserRound className="h-5 w-5" />}
          title="Ho so"
          description="Cap nhat ten hien thi va anh dai dien de giao dien Vivid mang dau an cua ban."
        >
          <form className="space-y-4" onSubmit={handleProfileSubmit}>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative h-20 w-20 overflow-hidden rounded-full border-[3px] border-[var(--tet-gold)]"
              >
                <img src={previewAvatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-[rgba(54,24,18,0.32)] text-[#FFFDD0]">
                  <Camera className="h-5 w-5" />
                </div>
              </button>

              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(128,0,32,0.14)] bg-[rgba(128,0,32,0.08)] px-4 py-2 text-sm font-medium text-[#800020]"
                >
                  <ImagePlus className="h-4 w-4" />
                  Tai anh dai dien
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <p className="mt-2 text-xs leading-relaxed text-[rgba(54,24,18,0.62)]">
                  Chon mot anh chan dung vuong. Vivid se hien thi anh duoi dang avatar tron sau khi ban luu.
                </p>
              </div>
            </div>

            {pendingAvatar && (
              <div className="rounded-[1.5rem] border border-[rgba(128,0,32,0.1)] bg-[rgba(255,253,208,0.56)] px-4 py-4">
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
              </div>
            )}

            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-[#800020]">Ten hien thi</span>
              <input
                value={profileForm.displayName}
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    displayName: event.target.value,
                  }))
                }
                className="w-full rounded-[1.3rem] border border-[rgba(128,0,32,0.18)] bg-[rgba(255,253,208,0.62)] px-4 py-3 text-sm text-[#361812] outline-none backdrop-blur-xl transition-all focus:border-[#800020] focus:ring-4 focus:ring-[rgba(128,0,32,0.12)]"
              />
            </label>

            {profileMessage && (
              <div className="rounded-[1.2rem] border border-[rgba(128,0,32,0.12)] bg-[rgba(128,0,32,0.08)] px-4 py-3 text-sm text-[#800020]">
                {profileMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSavingProfile}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#800020] px-4 py-3 text-sm font-medium text-[#FFFDD0] transition-colors hover:bg-[#68001a] disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {isSavingProfile ? "Dang luu..." : "Luu thay doi"}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          icon={<KeyRound className="h-5 w-5" />}
          title="Bao mat"
          description="Nhap mat khau hien tai truoc khi dat mat khau moi de giu tai khoan an toan."
        >
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-[#800020]">Mat khau hien tai</span>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: event.target.value,
                  }))
                }
                className="w-full rounded-[1.3rem] border border-[rgba(128,0,32,0.18)] bg-[rgba(255,253,208,0.62)] px-4 py-3 text-sm text-[#361812] outline-none backdrop-blur-xl transition-all focus:border-[#800020] focus:ring-4 focus:ring-[rgba(128,0,32,0.12)]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-[#800020]">Mat khau moi</span>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: event.target.value,
                  }))
                }
                className="w-full rounded-[1.3rem] border border-[rgba(128,0,32,0.18)] bg-[rgba(255,253,208,0.62)] px-4 py-3 text-sm text-[#361812] outline-none backdrop-blur-xl transition-all focus:border-[#800020] focus:ring-4 focus:ring-[rgba(128,0,32,0.12)]"
              />
            </label>

            {passwordMessage && (
              <div className="rounded-[1.2rem] border border-[rgba(128,0,32,0.12)] bg-[rgba(128,0,32,0.08)] px-4 py-3 text-sm text-[#800020]">
                {passwordMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isChangingPassword}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(128,0,32,0.18)] bg-[rgba(128,0,32,0.08)] px-4 py-3 text-sm font-medium text-[#800020] transition-colors hover:bg-[rgba(128,0,32,0.12)] disabled:opacity-70"
            >
              <KeyRound className="h-4 w-4" />
              {isChangingPassword ? "Dang doi mat khau..." : "Dat lai mat khau"}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Phien lam viec"
          description="Quan ly thiet bi hien tai va dang xuat khoi tai khoan khi ban muon dung phien nay."
        >
          <div className="rounded-[1.4rem] border border-[rgba(128,0,32,0.08)] bg-[rgba(255,253,208,0.48)] px-4 py-4">
            <p className="text-sm leading-relaxed text-[rgba(54,24,18,0.72)]">
              Ban dang dang nhap tren thiet bi nay. Ho so va avatar se duoc luu cho nhung lan mo app tiep theo.
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#800020] px-4 py-3 text-sm font-medium text-[#FFFDD0] transition-colors hover:bg-[#68001a]"
            >
              <LogOut className="h-4 w-4" />
              Dang xuat
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
