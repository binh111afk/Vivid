import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, ImagePlus, KeyRound, LogOut, Save, ShieldCheck, UserRound } from "lucide-react";
import Cropper from "react-easy-crop";

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
          {description ? <p className="mt-1 text-sm leading-relaxed text-[rgba(54,24,18,0.68)]">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = src;
  });
}

async function getCroppedAvatarDataUrl(imageSrc, cropPixels) {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const size = 420;

  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Không thể xử lý ảnh vào lúc này.");
  }

  context.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    size,
    size,
  );

  return canvas.toDataURL("image/jpeg", 0.92);
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
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState(null);
  const [isApplyingCrop, setIsApplyingCrop] = useState(false);
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
    setIsCropModalOpen(false);
    setImageToCrop("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedPixels(null);
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
      setImageToCrop(result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedPixels(null);
      setIsCropModalOpen(true);
      setProfileMessage("");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleCropComplete = (_, areaPixels) => {
    setCroppedPixels(areaPixels);
  };

  const handleCancelCrop = () => {
    setIsCropModalOpen(false);
    setImageToCrop("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedPixels(null);
  };

  const handleApplyCrop = async () => {
    if (!imageToCrop || !croppedPixels) {
      return;
    }

    setIsApplyingCrop(true);

    try {
      const croppedAvatar = await getCroppedAvatarDataUrl(imageToCrop, croppedPixels);
      setProfileForm((prev) => ({
        ...prev,
        avatar: croppedAvatar,
      }));
      setPendingAvatar(croppedAvatar);
      setProfileMessage("Ảnh đại diện mới đã được căn chỉnh, nhớ bấm Lưu thay đổi.");
      handleCancelCrop();
    } catch (error) {
      setProfileMessage(error?.message || "Không thể cắt ảnh. Vui lòng thử lại.");
    } finally {
      setIsApplyingCrop(false);
    }
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
    <div className="h-full overflow-y-auto px-5 py-4 font-sans" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
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
              alt={user.displayName ?? user.username ?? "Ảnh đại diện người dùng"}
              className="h-20 w-20 shrink-0 rounded-full border-[3px] border-[var(--tet-gold)] object-cover shadow-[0_18px_36px_rgba(128,0,32,0.12)]"
            />
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold text-[#800020]">{user.displayName || user.username}</p>
              <p className="mt-1 text-sm text-[rgba(54,24,18,0.7)]">@{user.username}</p>
              <p className="mt-2 text-xl font-semibold text-[#800020]">
                Trung tâm quản lý tài khoản
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pb-6">
        <SectionCard
          icon={<UserRound className="h-5 w-5" />}
          title="Hồ sơ"
        >
          <form className="space-y-4" onSubmit={handleProfileSubmit}>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-[3px] border-[var(--tet-gold)]"
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
                    Tải ảnh đại diện
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            {pendingAvatar && (
              <div className="rounded-[1.5rem] border border-[rgba(128,0,32,0.1)] bg-[rgba(255,253,208,0.56)] px-4 py-4">
                <div className="mb-3 flex items-center gap-2 text-[#800020]">
                  <ImagePlus className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">Xem trước avatar</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="rounded-full border-4 border-[var(--tet-gold)] p-1 shadow-[0_18px_35px_rgba(128,0,32,0.14)]">
                    <img
                      src={pendingAvatar}
                      alt="Xem trước ảnh đại diện mới"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-[#800020]">Tên hiển thị</span>
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
              {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          icon={<KeyRound className="h-5 w-5" />}
          title="Bảo mật"
        >
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-[#800020]">Mật khẩu hiện tại</span>
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
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-[#800020]">Mật khẩu mới</span>
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
              {isChangingPassword ? "Đang đổi mật khẩu..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Phiên làm việc"
        >
          <div className="rounded-[1.4rem] border border-[rgba(128,0,32,0.08)] bg-[rgba(255,253,208,0.48)] px-4 py-4">
            <p className="text-sm leading-relaxed text-[rgba(54,24,18,0.72)]">
              Bạn đang đăng nhập trên thiết bị này. Hồ sơ và avatar sẽ được lưu cho những lần mở ứng dụng tiếp theo.
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#800020] px-4 py-3 text-sm font-medium text-[#FFFDD0] transition-colors hover:bg-[#68001a]"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </SectionCard>
      </div>

      {isCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(54,24,18,0.45)] p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[1.8rem] border border-[rgba(128,0,32,0.14)] bg-[rgba(255,253,208,0.98)] p-5 shadow-[0_26px_50px_rgba(54,24,18,0.25)]">
            <h4 className="text-lg font-semibold text-[#800020]">Căn chỉnh ảnh đại diện</h4>
            <p className="mt-1 text-sm text-[rgba(54,24,18,0.72)]">
              Kéo ảnh để canh vị trí và dùng thanh trượt để phóng to hoặc thu nhỏ trong khung tròn.
            </p>

            <div className="relative mt-4 h-72 overflow-hidden rounded-[1.3rem] border border-[rgba(128,0,32,0.12)] bg-[rgba(128,0,32,0.08)]">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                objectFit="cover"
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-[#800020]">
                Độ phóng
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full accent-[#800020]"
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCancelCrop}
                className="inline-flex items-center justify-center rounded-full border border-[rgba(128,0,32,0.2)] bg-[rgba(255,255,255,0.6)] px-4 py-2.5 text-sm font-medium text-[#800020]"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isApplyingCrop || !croppedPixels}
                onClick={handleApplyCrop}
                className="inline-flex items-center justify-center rounded-full bg-[#800020] px-4 py-2.5 text-sm font-medium text-[#FFFDD0] transition-colors hover:bg-[#68001a] disabled:opacity-70"
              >
                {isApplyingCrop ? "Đang xử lý..." : "Dùng ảnh này"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
