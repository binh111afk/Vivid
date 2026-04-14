import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Camera, Users, Heart, History, TrendingUp, Lock, Globe, X, Copy, Check } from 'lucide-react';

// Mock data
const friends = [
  { id: 1, name: 'Mẹ', avatar: 'https://i.pravatar.cc/150?img=1', photo: 'https://picsum.photos/400/400?random=1', online: true, timestamp: '2 phút trước', caption: 'Hoa mai nở rồi con ơi! 🌼' },
  { id: 2, name: 'Ba', avatar: 'https://i.pravatar.cc/150?img=2', photo: 'https://picsum.photos/400/400?random=2', online: true, timestamp: '5 phút trước', caption: 'Sáng nay đi chợ' },
  { id: 3, name: 'Bé Hà', avatar: 'https://i.pravatar.cc/150?img=3', photo: 'https://picsum.photos/400/400?random=3', online: false, timestamp: '1 giờ trước', caption: 'Nhớ gia đình quá 💕' },
  { id: 4, name: 'Anh Tuấn', avatar: 'https://i.pravatar.cc/150?img=4', photo: 'https://picsum.photos/400/400?random=4', online: true, timestamp: '3 phút trước', caption: '' },
  { id: 5, name: 'Chị Mai', avatar: 'https://i.pravatar.cc/150?img=5', photo: 'https://picsum.photos/400/400?random=5', online: false, timestamp: '30 phút trước', caption: 'Chúc mừng năm mới! 🧧' },
];

const photoHistory = [
  { id: 1, photo: 'https://picsum.photos/400/400?random=11', sender: 'Mẹ', photographer: 'Bạn', date: '2026-04-14', time: '14:30', caption: 'Hoa mai nở rồi con ơi! 🌼' },
  { id: 2, photo: 'https://picsum.photos/400/400?random=12', sender: 'Ba', photographer: 'Bạn', date: '2026-04-14', time: '10:15', caption: 'Sáng nay đi chợ' },
  { id: 3, photo: 'https://picsum.photos/400/400?random=13', sender: 'Bé Hà', photographer: 'Mẹ', date: '2026-04-13', time: '18:20', caption: 'Nhớ gia đình quá 💕' },
  { id: 4, photo: 'https://picsum.photos/400/400?random=14', sender: 'Anh Tuấn', photographer: 'Bạn', date: '2026-04-13', time: '12:45', caption: '' },
  { id: 5, photo: 'https://picsum.photos/400/400?random=15', sender: 'Chị Mai', photographer: 'Ba', date: '2026-04-12', time: '09:30', caption: 'Chúc mừng năm mới! 🧧' },
  { id: 6, photo: 'https://picsum.photos/400/400?random=16', sender: 'Mẹ', photographer: 'Bạn', date: '2026-04-11', time: '16:00', caption: 'Làm bánh chưng' },
  { id: 7, photo: 'https://picsum.photos/400/400?random=17', sender: 'Ba', photographer: 'Mẹ', date: '2026-04-10', time: '11:20', caption: 'Dọn dẹp nhà cửa' },
  { id: 8, photo: 'https://picsum.photos/400/400?random=18', sender: 'Bé Hà', photographer: 'Bé Hà', date: '2026-04-08', time: '15:45', caption: 'Học bài xong rồi!' },
  { id: 9, photo: 'https://picsum.photos/400/400?random=19', sender: 'Anh Tuấn', photographer: 'Anh Tuấn', date: '2026-03-28', time: '13:30', caption: 'Đi cafe với bạn' },
  { id: 10, photo: 'https://picsum.photos/400/400?random=20', sender: 'Chị Mai', photographer: 'Chị Mai', date: '2026-03-25', time: '17:15', caption: 'Tết đến rồi!' },
];

const summaries = [
  {
    id: 1,
    type: 'week',
    period: 'Tuần 15 - Tháng 4',
    author: 'Bạn',
    content: 'Tuần này bạn đã lên thư viện 2 lần và hoàn thành 3 bài tập lớn. Bạn cũng đã chụp 8 ảnh gửi cho gia đình! 📚',
    isPublic: true,
    date: '2026-04-14'
  },
  {
    id: 2,
    type: 'week',
    period: 'Tuần 14 - Tháng 4',
    author: 'Bạn',
    content: 'Chạy bộ 3 lần trong tuần, đạt kỷ lục cá nhân 5km. Tiếp tục phát huy! 🏃‍♂️',
    isPublic: false,
    date: '2026-04-07'
  },
  {
    id: 3,
    type: 'month',
    period: 'Tháng 3 - 2026',
    author: 'Bạn',
    content: 'Tháng 3 bạn đã chạy bộ 10 lần, đọc xong 2 cuốn sách và đạt được thành tích học sinh giỏi! Xuất sắc! 🎉',
    isPublic: true,
    date: '2026-03-31'
  },
  {
    id: 4,
    type: 'week',
    period: 'Tuần 15 - Tháng 4',
    author: 'Mẹ',
    content: 'Tuần này mẹ đã nấu 5 món ăn mới và chụp ảnh gửi cho các con mỗi ngày. Gia đình là số 1! 🍲',
    isPublic: true,
    date: '2026-04-14'
  },
  {
    id: 5,
    type: 'week',
    period: 'Tuần 14 - Tháng 4',
    author: 'Ba',
    content: 'Sửa được cái máy tính cũ, đi chợ 3 lần trong tuần. Cuộc sống bình yên! 🔧',
    isPublic: true,
    date: '2026-04-07'
  },
  {
    id: 6,
    type: 'month',
    period: 'Tháng 3 - 2026',
    author: 'Bé Hà',
    content: 'Tháng 3 em đã học xong 2 khóa học online và thi đỗ bằng lái xe! Tự hào quá! 🚗',
    isPublic: true,
    date: '2026-03-31'
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'summary' | 'friends'>('home');
  const [showNotification, setShowNotification] = useState(false);
  const [liked, setLiked] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'day' | 'week' | 'month'>('day');
  const [selectedFriend, setSelectedFriend] = useState<string>('Bạn');
  const [summaryFilter, setSummaryFilter] = useState<'week' | 'month'>('week');
  const [summaryView, setSummaryView] = useState<'personal' | 'feed'>('personal');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [caption, setCaption] = useState('');
  const [showInvitePopup, setShowInvitePopup] = useState(false);

  const latestPhoto = friends[0];
  const deviceFrameStyle = {
    background: 'var(--tet-cream)',
    width: 'min(390px, calc(100vw - 1rem), calc((100dvh - 1rem) * 390 / 844))',
    maxHeight: 'calc(100dvh - 1rem)',
    aspectRatio: '390 / 844',
  } as const;

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
  };

  const handleSend = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
    setCapturedImage(null);
    setCaption('');
    setSelectedRecipients([]);
    setShowCamera(false);
  };

  const toggleRecipient = (id: number) => {
    setSelectedRecipients(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowNotification(true), 1000);
    const hideTimer = setTimeout(() => setShowNotification(false), 4000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div
      className="relative flex min-h-dvh items-center justify-center overflow-hidden p-2 sm:p-4"
      style={{ background: 'var(--tet-cream)' }}
    >
      {/* Decorative cherry blossoms */}
      <CherryBlossom style={{ position: 'absolute', top: '2rem', left: '1rem', opacity: 0.15 }} />
      <CherryBlossom style={{ position: 'absolute', top: '3rem', right: '2rem', opacity: 0.1, transform: 'scale(0.8) rotate(45deg)' }} />
      <CherryBlossom style={{ position: 'absolute', bottom: '8rem', left: '3rem', opacity: 0.12, transform: 'scale(0.6) rotate(-30deg)' }} />

      {/* Mobile container */}
      <div
        className="relative overflow-hidden rounded-[2.5rem] shadow-2xl"
        style={deviceFrameStyle}
      >
        {/* Red pattern background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle, var(--tet-red) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />

        {/* Content */}
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <header className="px-6 pt-6 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VividLogo />
              <h1 className="text-2xl" style={{ color: 'var(--tet-red)' }}>Vivid</h1>
            </div>
            <div className="flex items-center gap-3">
              <Lantern />
              <div
                className="w-10 h-10 rounded-full overflow-hidden shadow-lg cursor-pointer"
                style={{ border: '2px solid var(--tet-gold)' }}
              >
                <img src="https://i.pravatar.cc/150?img=8" alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          </header>

          {/* Main content area */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full"
                >
                  <HomeScreen
                    photo={latestPhoto}
                    liked={liked}
                    onLike={() => setLiked(!liked)}
                    onCameraClick={() => setShowCamera(true)}
                  />
                </motion.div>
              )}
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full"
                >
                  <HistoryScreen
                    photos={photoHistory}
                    filter={historyFilter}
                    onFilterChange={setHistoryFilter}
                    friends={friends}
                    selectedFriend={selectedFriend}
                    onFriendChange={setSelectedFriend}
                  />
                </motion.div>
              )}
              {activeTab === 'summary' && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full"
                >
                  <SummaryScreen
                    summaries={summaries}
                    filter={summaryFilter}
                    onFilterChange={setSummaryFilter}
                    view={summaryView}
                    onViewChange={setSummaryView}
                  />
                </motion.div>
              )}
              {activeTab === 'friends' && (
                <motion.div
                  key="friends"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <FriendsScreen friends={friends} onInvite={() => setShowInvitePopup(true)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom navigation */}
          <nav className="relative z-10" style={{ background: 'var(--tet-deep-red)' }}>
            <div className="flex items-center justify-around px-4 py-4">
              <NavButton
                icon={<Home size={22} />}
                label="Trang chủ"
                active={activeTab === 'home'}
                onClick={() => setActiveTab('home')}
              />
              <NavButton
                icon={<History size={22} />}
                label="Lịch sử"
                active={activeTab === 'history'}
                onClick={() => setActiveTab('history')}
              />
              <NavButton
                icon={<TrendingUp size={22} />}
                label="Tổng kết"
                active={activeTab === 'summary'}
                onClick={() => setActiveTab('summary')}
              />
              <NavButton
                icon={<Users size={22} />}
                label="Bạn bè"
                active={activeTab === 'friends'}
                onClick={() => setActiveTab('friends')}
              />
            </div>
          </nav>
        </div>
      </div>

      {/* Notification toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed left-1/2 top-4 z-50 max-w-[calc(100vw-1rem)] -translate-x-1/2 rounded-full px-4 py-3 shadow-2xl sm:top-8 sm:px-6 sm:py-4"
            style={{
              background: 'var(--tet-red)',
              border: '2px solid var(--tet-gold)',
              color: 'var(--tet-cream)',
              maxWidth: '90%'
            }}
          >
            <p className="text-center font-medium">{latestPhoto.name} vừa gửi ảnh cho bạn! 📸</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            style={{ background: 'rgba(0, 0, 0, 0.8)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="overflow-hidden rounded-[2.5rem] shadow-2xl"
              style={deviceFrameStyle}
            >
              <CameraScreen
                capturedImage={capturedImage}
                onCapture={handleCapture}
                onSend={handleSend}
                friends={friends}
                selectedRecipients={selectedRecipients}
                onToggleRecipient={toggleRecipient}
                caption={caption}
                onCaptionChange={setCaption}
                onBack={() => {
                  setCapturedImage(null);
                  setShowCamera(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite popup */}
      <AnimatePresence>
        {showInvitePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            style={{ background: 'rgba(0, 0, 0, 0.6)' }}
            onClick={() => setShowInvitePopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[340px] rounded-3xl overflow-hidden shadow-2xl p-6"
              style={{
                background: 'var(--tet-cream)',
                border: '3px solid var(--tet-gold)'
              }}
            >
              <InvitePopup onClose={() => setShowInvitePopup(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HomeScreen({ photo, liked, onLike, onCameraClick }: any) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-1 pb-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative w-full px-1"
      >
        {/* Photo frame */}
        <div
          className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl"
          style={{ border: '4px solid var(--tet-gold)' }}
        >
          <img src={photo.photo} alt="Latest" className="w-full h-full object-cover" />

          {/* Caption overlay */}
          {photo.caption && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4/5 px-4 py-3 rounded-2xl" style={{
              background: 'rgba(0, 0, 0, 0.6)'
            }}>
              <p className="text-center" style={{ color: 'white' }}>{photo.caption}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Sender info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center"
      >
        <p className="text-lg" style={{ color: 'var(--tet-black)', fontFamily: 'var(--font-body)' }}>
          <span style={{ color: 'var(--tet-red)' }}>{photo.name}</span> gửi · {photo.timestamp}
        </p>
      </motion.div>

      {/* Heart button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.85 }}
        onClick={onLike}
        className="mt-6 px-8 py-3 rounded-full flex items-center gap-2 shadow-lg transition-all"
        style={{
          background: liked ? 'var(--tet-gold)' : 'var(--tet-red)',
          border: '2px solid var(--tet-gold)',
          color: 'var(--tet-cream)'
        }}
      >
        <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
        <span className="font-medium">{liked ? 'Đã thích' : 'Thích'}</span>
      </motion.button>

      {/* Camera button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCameraClick}
        className="mt-4 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all"
        style={{
          background: 'white',
          border: '3px solid var(--tet-red)'
        }}
      >
        <Camera size={28} style={{ color: 'var(--tet-red)' }} />
      </motion.button>
    </div>
  );
}

function CameraScreen({ capturedImage, onCapture, onSend, friends, selectedRecipients, onToggleRecipient, caption, onCaptionChange, onBack }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });

        if (mounted && videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setCameraError(false);
        }
      } catch (error: any) {
        // Handle camera permission denial gracefully
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          // User denied camera permission - use fallback
          setCameraError(true);
        } else {
          // Other camera errors
          console.warn('Camera unavailable:', error.name);
          setCameraError(true);
        }
      }
    };

    if (!capturedImage) {
      startCamera();
    }

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturedImage]);

  const handleCapture = () => {
    if (cameraError) {
      // Use placeholder image if camera is not available
      const placeholderImage = `https://picsum.photos/400/600?random=${Date.now()}`;
      onCapture(placeholderImage);
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        onCapture(imageData);
      }
    }
  };

  if (!capturedImage) {
    return (
      <div className="h-full flex flex-col">
        {/* Camera preview */}
        <div className="flex-1 relative overflow-hidden" style={{ background: '#1a1a1a' }}>
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
              <Camera size={64} style={{ color: 'var(--tet-gold)', opacity: 0.5 }} className="mb-4" />
              <p className="text-center mb-2" style={{ color: 'var(--tet-cream)' }}>
                Không thể truy cập camera
              </p>
              <p className="text-center text-sm opacity-70" style={{ color: 'var(--tet-cream)' }}>
                Vui lòng cấp quyền camera hoặc sử dụng ảnh mẫu
              </p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />

          {/* Close button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-10"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <X size={24} style={{ color: 'white' }} />
          </motion.button>
        </div>

        {/* Capture button */}
        <div className="p-8 flex flex-col items-center" style={{ background: 'var(--tet-cream)' }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCapture}
            className="w-20 h-20 rounded-full relative shadow-2xl"
            style={{
              background: 'var(--tet-red)',
              border: '4px solid var(--tet-gold)'
            }}
          >
            <div className="absolute inset-2 rounded-full" style={{ background: 'var(--tet-cream)' }} />
          </motion.button>
          {cameraError && (
            <p className="text-xs mt-3 opacity-70" style={{ color: 'var(--tet-black)' }}>
              Sử dụng ảnh mẫu
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 relative">
      {/* Close button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onBack}
        className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-10"
        style={{
          background: 'var(--tet-red)',
          border: '2px solid var(--tet-gold)'
        }}
      >
        <X size={24} style={{ color: 'var(--tet-cream)' }} />
      </motion.button>

      {/* Recipient selector */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-4">
        {friends.map((friend: any) => (
          <motion.button
            key={friend.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggleRecipient(friend.id)}
            className="flex-shrink-0 relative"
          >
            <div
              className="w-14 h-14 rounded-full overflow-hidden transition-all"
              style={{
                border: selectedRecipients.includes(friend.id)
                  ? '3px solid var(--tet-red)'
                  : '2px solid var(--tet-gold)',
                opacity: selectedRecipients.includes(friend.id) ? 1 : 0.5
              }}
            >
              <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
            </div>
            <p className="text-xs mt-1 text-center" style={{ color: 'var(--tet-black)' }}>{friend.name}</p>
          </motion.button>
        ))}
      </div>

      {/* Preview */}
      <div className="flex-1 rounded-3xl overflow-hidden shadow-2xl mb-4" style={{ border: '3px solid var(--tet-gold)' }}>
        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
      </div>

      {/* Caption input */}
      <input
        type="text"
        placeholder="Thêm chú thích... (tối đa 40 ký tự)"
        value={caption}
        onChange={(e) => onCaptionChange(e.target.value.slice(0, 40))}
        maxLength={40}
        className="px-4 py-3 rounded-2xl mb-4 outline-none"
        style={{
          background: 'white',
          border: '2px solid var(--tet-gold)',
          color: 'var(--tet-black)'
        }}
      />

      {/* Action buttons */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex-1 py-4 rounded-full font-medium shadow-lg"
          style={{
            background: 'white',
            border: '2px solid var(--tet-gold)',
            color: 'var(--tet-red)'
          }}
        >
          Hủy
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onSend}
          disabled={selectedRecipients.length === 0}
          className="flex-1 py-4 rounded-full font-medium shadow-lg transition-opacity"
          style={{
            background: selectedRecipients.length > 0 ? 'var(--tet-red)' : '#ccc',
            border: '2px solid var(--tet-gold)',
            color: 'var(--tet-cream)',
            opacity: selectedRecipients.length > 0 ? 1 : 0.5
          }}
        >
          Gửi
        </motion.button>
      </div>
    </div>
  );
}

function HistoryScreen({ photos, filter, onFilterChange, friends, selectedFriend, onFriendChange }: any) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date('2026-04-14');
    const yesterday = new Date('2026-04-13');

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' });
    }
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const groupPhotosByFilter = () => {
    const grouped: any = {};

    // Filter photos by selected friend
    const filteredPhotos = photos.filter((photo: any) => photo.photographer === selectedFriend);

    filteredPhotos.forEach((photo: any) => {
      const date = new Date(photo.date);
      let key = '';

      if (filter === 'day') {
        key = formatDate(photo.date);
      } else if (filter === 'week') {
        const week = getWeekNumber(date);
        key = `Tuần ${week}`;
      } else {
        key = date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(photo);
    });

    return grouped;
  };

  const groupedPhotos = groupPhotosByFilter();

  const allFriends = [
    { id: 0, name: 'Bạn', avatar: 'https://i.pravatar.cc/150?img=8' },
    ...friends
  ];

  return (
    <div className="h-full overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <h2 className="mb-4 text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--tet-red)' }}>
        Lịch sử
      </h2>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        <FilterButton
          label="Ngày"
          active={filter === 'day'}
          onClick={() => onFilterChange('day')}
        />
        <FilterButton
          label="Tuần"
          active={filter === 'week'}
          onClick={() => onFilterChange('week')}
        />
        <FilterButton
          label="Tháng"
          active={filter === 'month'}
          onClick={() => onFilterChange('month')}
        />
      </div>

      {/* Friend avatars */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {allFriends.map((friend: any) => (
          <motion.button
            key={friend.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => onFriendChange(friend.name)}
            className="flex-shrink-0 relative"
          >
            <div
              className="w-14 h-14 rounded-full overflow-hidden transition-all shadow-md"
              style={{
                border: selectedFriend === friend.name
                  ? '3px solid var(--tet-red)'
                  : '2px solid var(--tet-gold)',
                opacity: selectedFriend === friend.name ? 1 : 0.6
              }}
            >
              <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
            </div>
            <p className="text-xs mt-1 text-center font-medium" style={{
              color: selectedFriend === friend.name ? 'var(--tet-red)' : 'var(--tet-black)'
            }}>
              {friend.name}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Photo groups */}
      <div className="space-y-6 pb-4">
        {Object.entries(groupedPhotos).map(([period, periodPhotos]: any, index: number) => (
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h3 className="mb-3 text-lg font-medium" style={{ color: 'var(--tet-red)' }}>
              {period}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {periodPhotos.map((photo: any) => (
                <motion.div
                  key={photo.id}
                  whileHover={{ scale: 1.05 }}
                  className="relative aspect-square rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                  style={{ border: '2px solid var(--tet-gold)' }}
                >
                  <img src={photo.photo} alt={photo.sender} className="w-full h-full object-cover" />

                  {/* Caption overlay */}
                  {photo.caption && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-4/5 px-2 py-1.5 rounded-lg" style={{
                      background: 'rgba(0, 0, 0, 0.6)'
                    }}>
                      <p className="text-xs line-clamp-2 text-center" style={{ color: 'white' }}>
                        {photo.caption}
                      </p>
                    </div>
                  )}

                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-2" style={{
                    background: 'linear-gradient(to top, rgba(26, 10, 0, 0.8), transparent)'
                  }}>
                    <p className="text-xs font-medium" style={{ color: 'var(--tet-cream)' }}>
                      {photo.sender}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--tet-gold)' }}>
                      {photo.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FilterButton({ label, active, onClick }: any) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="px-6 py-2 rounded-full font-medium shadow-md transition-all"
      style={{
        background: active ? 'var(--tet-red)' : 'white',
        border: '2px solid var(--tet-gold)',
        color: active ? 'var(--tet-cream)' : 'var(--tet-red)'
      }}
    >
      {label}
    </motion.button>
  );
}

function SummaryScreen({ summaries, filter, onFilterChange, view, onViewChange }: any) {
  const [publicStates, setPublicStates] = useState<{ [key: number]: boolean }>(
    summaries.reduce((acc: any, summary: any) => {
      acc[summary.id] = summary.isPublic;
      return acc;
    }, {})
  );

  const togglePublic = (id: number) => {
    setPublicStates((prev: any) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredSummaries = summaries.filter((summary: any) => {
    // Filter by time period
    if (summary.type !== filter) return false;

    // Filter by view
    if (view === 'personal') {
      return summary.author === 'Bạn';
    } else {
      // Feed: show public summaries from user and friends
      return publicStates[summary.id];
    }
  });

  return (
    <div className="h-full overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <h2 className="mb-4 text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--tet-red)' }}>
        Tổng kết
      </h2>

      {/* View toggle */}
      <div className="flex gap-2 mb-4">
        <ViewButton
          label="Bản thân"
          active={view === 'personal'}
          onClick={() => onViewChange('personal')}
        />
        <ViewButton
          label="Bảng tin"
          active={view === 'feed'}
          onClick={() => onViewChange('feed')}
        />
      </div>

      {/* Time filter buttons */}
      <div className="flex gap-2 mb-6">
        <FilterButton
          label="Tuần"
          active={filter === 'week'}
          onClick={() => onFilterChange('week')}
        />
        <FilterButton
          label="Tháng"
          active={filter === 'month'}
          onClick={() => onFilterChange('month')}
        />
      </div>

      {/* Summary cards */}
      <div className="space-y-4 pb-4">
        {filteredSummaries.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: 'var(--tet-red)', opacity: 0.6 }}>
              Chưa có tổng kết nào
            </p>
          </div>
        ) : (
          filteredSummaries.map((summary: any, index: number) => (
            <motion.div
              key={summary.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-3xl overflow-hidden shadow-lg p-5"
              style={{
                background: 'white',
                border: '2px solid var(--tet-gold)'
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: 'var(--tet-red)' }}>
                    {summary.period}
                  </h3>
                  <p className="text-sm opacity-70" style={{ color: 'var(--tet-black)' }}>
                    {summary.author}
                  </p>
                </div>
                {view === 'personal' && summary.author === 'Bạn' && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => togglePublic(summary.id)}
                    className="p-2 rounded-full transition-colors"
                    style={{
                      background: publicStates[summary.id] ? 'var(--tet-gold)' : 'var(--tet-cream)',
                      color: publicStates[summary.id] ? 'white' : 'var(--tet-black)'
                    }}
                  >
                    {publicStates[summary.id] ? (
                      <Globe size={18} />
                    ) : (
                      <Lock size={18} />
                    )}
                  </motion.button>
                )}
              </div>

              {/* Content */}
              <p className="leading-relaxed" style={{ color: 'var(--tet-black)' }}>
                {summary.content}
              </p>

              {/* Decorative accent */}
              <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--tet-gold)' }}>
                <p className="text-xs opacity-50" style={{ color: 'var(--tet-black)' }}>
                  {summary.date}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function ViewButton({ label, active, onClick }: any) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="px-6 py-2 rounded-full font-medium shadow-md transition-all"
      style={{
        background: active ? 'var(--tet-red)' : 'white',
        border: '2px solid var(--tet-gold)',
        color: active ? 'var(--tet-cream)' : 'var(--tet-red)'
      }}
    >
      {label}
    </motion.button>
  );
}

function InvitePopup({ onClose }: any) {
  const [copied, setCopied] = useState(false);
  const inviteLink = 'https://vivid.app/invite/abc123xyz';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="text-center">
      <h3 className="text-xl mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--tet-red)' }}>
        Mời bạn bè
      </h3>
      <p className="mb-4" style={{ color: 'var(--tet-black)' }}>
        Sao chép link để gửi cho bạn bè
      </p>

      <div className="mb-4 p-3 rounded-2xl" style={{ background: 'white', border: '2px solid var(--tet-gold)' }}>
        <p className="text-sm break-all" style={{ color: 'var(--tet-black)' }}>
          {inviteLink}
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleCopy}
        className="w-full py-4 rounded-full font-medium shadow-lg flex items-center justify-center gap-2 mb-3"
        style={{
          background: copied ? 'var(--tet-gold)' : 'var(--tet-red)',
          border: '2px solid var(--tet-gold)',
          color: 'var(--tet-cream)'
        }}
      >
        {copied ? (
          <>
            <Check size={20} />
            <span>Đã sao chép!</span>
          </>
        ) : (
          <>
            <Copy size={20} />
            <span>Sao chép link</span>
          </>
        )}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        className="text-sm opacity-70"
        style={{ color: 'var(--tet-black)' }}
      >
        Đóng
      </motion.button>
    </div>
  );
}

function FriendsScreen({ friends, onInvite }: any) {
  return (
    <div className="h-full overflow-y-auto px-6 py-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <h2 className="mb-6 text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--tet-red)' }}>
        Bạn bè của bạn
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {friends.map((friend: any, index: number) => (
          <motion.div
            key={friend.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative rounded-2xl overflow-hidden shadow-lg aspect-square"
            style={{ border: '2px solid var(--tet-gold)' }}
          >
            <img src={friend.photo} alt={friend.name} className="w-full h-full object-cover" />

            {/* Caption overlay */}
            {friend.caption && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-4/5 px-3 py-2 rounded-xl" style={{
                background: 'rgba(0, 0, 0, 0.6)'
              }}>
                <p className="text-sm line-clamp-2 text-center" style={{ color: 'white' }}>
                  {friend.caption}
                </p>
              </div>
            )}

            {/* Friend info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3" style={{
              background: 'linear-gradient(to top, rgba(26, 10, 0, 0.9), transparent)'
            }}>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full overflow-hidden"
                  style={{ border: '2px solid var(--tet-gold)' }}
                >
                  <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm" style={{ color: 'var(--tet-cream)' }}>{friend.name}</p>
                  <p className="text-xs" style={{ color: 'var(--tet-gold)' }}>{friend.timestamp}</p>
                </div>
                {friend.online && (
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--tet-gold)' }} />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add friend button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onInvite}
        className="w-full py-4 rounded-full font-medium shadow-lg"
        style={{
          background: 'var(--tet-red)',
          border: '2px solid var(--tet-gold)',
          color: 'var(--tet-cream)'
        }}
      >
        + Thêm bạn bè
      </motion.button>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: any) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1 transition-all"
      style={{
        color: active ? 'var(--tet-gold)' : 'rgba(253, 246, 236, 0.6)'
      }}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </motion.button>
  );
}

function CherryBlossom({ style }: any) {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={style}>
      <path
        d="M30 15C30 15 25 20 25 25C25 30 30 30 30 30C30 30 30 25 35 25C40 25 45 20 45 15C45 15 40 20 35 20C30 20 30 15 30 15Z"
        fill="var(--tet-gold)"
      />
      <path
        d="M30 30C30 30 25 35 20 35C15 35 15 30 15 30C15 30 20 30 20 25C20 20 15 15 15 15C15 15 20 20 25 20C30 20 30 30 30 30Z"
        fill="var(--tet-gold)"
      />
      <path
        d="M30 30C30 30 35 35 40 35C45 35 45 30 45 30C45 30 40 30 40 25C40 20 45 15 45 15C45 15 40 20 35 20C30 20 30 30 30 30Z"
        fill="var(--tet-gold)"
      />
      <path
        d="M30 30C30 30 25 35 25 40C25 45 30 45 30 45C30 45 30 40 35 40C40 40 45 45 45 45C45 45 40 40 35 35C30 35 30 30 30 30Z"
        fill="var(--tet-gold)"
      />
      <circle cx="30" cy="30" r="3" fill="var(--tet-red)" />
    </svg>
  );
}

function VividLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <path d="M813.09 238.24H200.855s-35.86 11.324-35.86 79.27 35.86 81.157 35.86 81.157H813.09s-30.833-13.212-30.833-80.214 30.833-80.213 30.833-80.213z" fill="#FCE3C3"></path>
      <path d="M836.11 411.167H198.626l-2.092-0.771c-1.798-0.662-44.039-17.096-44.039-92.887 0-76.229 42.775-90.614 44.597-91.189l1.837-0.58H836.11v25H203.434c-5.723 2.987-25.938 17.064-25.938 66.77 0 49.62 20.176 65.117 26.251 68.657H836.11v25z" fill="#300604"></path>
      <path d="M256.75 275.988h231.233v18.873H256.75zM390.334 310.933h344.649v23.043H390.334zM262.52 349.398h150.736v23.043H262.52z" fill="#ED8F27"></path>
      <path d="M907.017 433.246H294.782s-35.86 11.324-35.86 79.27 35.86 81.157 35.86 81.157h612.235s-30.833-13.212-30.833-80.214 30.833-80.213 30.833-80.213z" fill="#FCE3C3"></path>
      <path d="M930.037 606.173H292.553l-2.092-0.771c-1.798-0.662-44.039-17.096-44.039-92.887 0-76.229 42.775-90.614 44.597-91.189l1.837-0.58h637.182v25H297.36c-5.723 2.987-25.938 17.064-25.938 66.77 0 49.62 20.176 65.117 26.251 68.657h632.364v25z" fill="#300604"></path>
      <path d="M354.857 541.566h431.325v23.043H354.857z" fill="#ED8F27"></path>
      <path d="M792.055 627.604H179.82s-35.86 11.324-35.86 79.27 35.86 81.157 35.86 81.157h612.235s-30.833-13.212-30.833-80.214 30.833-80.213 30.833-80.213z" fill="#FCE3C3"></path>
      <path d="M815.075 800.531H177.59l-2.092-0.771c-1.799-0.663-44.038-17.097-44.038-92.887 0-76.229 42.774-90.614 44.595-91.189l1.838-0.58h637.183v25H182.397c-5.723 2.987-25.938 17.064-25.938 66.77 0 49.619 20.175 65.117 26.25 68.657h632.365v25z" fill="#300604"></path>
      <path d="M265.709 708.718l-50.263 147.29 153.236-57.634z" fill="#FCE3C3"></path>
      <path d="M314.22 744.184l54.462 54.19L697.02 470.635l-51.623-47.93z" fill="#B12800"></path>
      <path d="M268.266 699.017l54.461 54.19 328.339-327.739-51.623-47.93z" fill="#ED8F27"></path>
      <path d="M645.397 329.934l58.74-57.215 41.085-3.024 52.717 53.485 3.061 42-66.183 67.658z" fill="#228E9D"></path>
      <path d="M362.732 805.746l-97.023-97.028a8.645 8.645 0 0 1 0-12.226l422.24-422.237c11.268-11.271 26.55-17.075 42.624-16.073 13.979 0.871 26.973 7.542 36.878 17.445l29.748 29.746c21.576 21.574 21.578 56.555 0.002 78.131L374.957 805.746a8.644 8.644 0 0 1-12.225 0z m-77.039-103.141l83.152 83.158 415.308-415.308c14.343-14.341 14.34-37.686-0.003-52.032l-31.123-31.12c-6.948-6.951-16.187-10.778-26.013-10.778s-19.065 3.827-26.016 10.778L285.693 702.605z" fill="#300604"></path>
      <path d="M697.02 470.642l-96.201-96.201 40.744-40.745 96.201 96.201z" fill="#300604"></path>
      <path d="M697.02 483.681L587.766 374.432l53.798-53.793 109.249 109.249-53.793 53.793z m-83.151-109.249l83.152 83.152 27.695-27.695-83.152-83.152-27.695 27.695z" fill="#300604"></path>
      <path d="M745.703 381.239l-13.049-13.049 18.11-18.107c3.265-3.268 3.265-8.585-0.003-11.853l-8.768-8.771 13.049-13.049 8.771 8.771c10.459 10.465 10.459 27.485 0.003 37.951l-18.113 18.107zM638.998 419.4l13.05 13.048L327.27 757.224l-13.049-13.049z" fill="#300604"></path>
      <path d="M199.742 871.713L264 699.379l17.289 6.452-50.139 134.475 134.471-50.14 6.447 17.29z" fill="#300604"></path>
      <path d="M215.446 856.008l57.278-25.908-31.37-31.371z" fill="#300604"></path>
      <path d="M196.954 874.501l41.489-91.736 50.242 50.241-91.731 41.495z m47.311-59.812l-10.328 22.829 22.829-10.327-12.501-12.502z" fill="#300604"></path>
    </svg>
  );
}

function Lantern() {
  return (
    <motion.svg
      width="32"
      height="40"
      viewBox="0 0 32 40"
      fill="none"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <rect x="6" y="4" width="20" height="28" rx="3" fill="var(--tet-red)" />
      <rect x="8" y="6" width="16" height="24" rx="2" fill="var(--tet-gold)" opacity="0.3" />
      <line x1="16" y1="0" x2="16" y2="4" stroke="var(--tet-gold)" strokeWidth="2" />
      <line x1="16" y1="32" x2="16" y2="40" stroke="var(--tet-gold)" strokeWidth="2" />
      <circle cx="16" cy="39" r="1.5" fill="var(--tet-gold)" />
    </motion.svg>
  );
}
