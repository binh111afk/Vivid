import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Camera, Users, Heart, History, TrendingUp, Lock, Globe, X, Copy, Check, Trash2 } from 'lucide-react';
import UserAuth from './components/UserAuth.jsx';
import AuthPage, { useAuth } from './components/AuthPage.jsx';
import AccountPage from './components/AccountPage.jsx';

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

function AuthGate() {
  return (
    <div
      className="theme-vivid relative flex min-h-dvh items-center justify-center overflow-hidden p-4"
      style={{ background: 'var(--tet-cream)' }}
    >
      <CherryBlossom style={{ position: 'absolute', top: '2rem', left: '1rem', opacity: 0.15 }} />
      <CherryBlossom style={{ position: 'absolute', top: '3rem', right: '2rem', opacity: 0.1, transform: 'scale(0.8) rotate(45deg)' }} />
      <CherryBlossom style={{ position: 'absolute', bottom: '8rem', left: '3rem', opacity: 0.12, transform: 'scale(0.6) rotate(-30deg)' }} />

      <div className="relative z-10 w-full max-w-[24rem]">
        <div className="mb-6 text-center">
          <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[rgba(128,0,32,0.12)] bg-[rgba(255,253,208,0.38)] px-5 py-3 shadow-[0_18px_40px_rgba(128,0,32,0.12)] backdrop-blur-xl">
            <VividLogo />
            <span className="text-3xl font-semibold" style={{ color: 'var(--tet-red)', fontFamily: 'var(--font-display)' }}>
              Vivid
            </span>
          </div>
          <p className="mx-auto max-w-[20rem] text-sm leading-relaxed" style={{ color: 'rgba(54,24,18,0.72)' }}>
            Đăng nhập hoặc tạo tài khoản để bước vào không gian lưu giữ những khoảnh khắc thân thương.
          </p>
        </div>

        <AuthPage onSuccess={() => {}} />
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="theme-vivid flex min-h-dvh items-center justify-center"
        style={{ background: 'var(--tet-cream)' }}
      >
        <div className="rounded-full border border-[rgba(128,0,32,0.14)] bg-[rgba(255,253,208,0.42)] px-5 py-3 text-sm font-medium text-[#800020] shadow-[0_18px_45px_rgba(128,0,32,0.12)] backdrop-blur-xl">
          Đang tải phiên làm việc...
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthGate />;
  }

  return <>{children}</>;
}

export default function App() {
  const { user } = useAuth() as any;
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'summary' | 'friends' | 'account'>('home');
  const [showNotification, setShowNotification] = useState(false);
  const [likedPhotoIds, setLikedPhotoIds] = useState<number[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'day' | 'week' | 'month'>('day');
  const [selectedFriend, setSelectedFriend] = useState<string>('Bạn');
  const [summaryFilter, setSummaryFilter] = useState<'day' | 'week' | 'month'>('day');
  const [summaryView, setSummaryView] = useState<'personal' | 'feed'>('personal');
  const [showCamera, setShowCamera] = useState(false);
  const [isSendingPost, setIsSendingPost] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [caption, setCaption] = useState('');
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [feedPhotos, setFeedPhotos] = useState<any[]>(friends);
  const [summaryItems, setSummaryItems] = useState<any[]>([]);
  const [currentHomePhotoId, setCurrentHomePhotoId] = useState(friends[0].id);

  const latestPhoto = feedPhotos.find((friend) => friend.id === currentHomePhotoId) ?? feedPhotos[0] ?? friends[0];
  const deviceFrameStyle = {
    background: 'var(--tet-cream)',
    width: 'min(390px, calc(100vw - 1rem), calc((100dvh - 1rem) * 390 / 844))',
    maxHeight: 'calc(100dvh - 1rem)',
    aspectRatio: '390 / 844',
  } as const;

  const formatFeedTimestamp = (value: string) => {
    const createdAt = new Date(value);
    const diffMs = Date.now() - createdAt.getTime();

    if (Number.isNaN(createdAt.getTime()) || diffMs < 0) {
      return 'Vừa xong';
    }

    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) {
      return 'Vừa xong';
    }
    if (minutes < 60) {
      return `${minutes} phút trước`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} giờ trước`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days} ngày trước`;
    }

    return createdAt.toLocaleDateString('vi-VN');
  };

  const mapFeedItem = (post: any) => ({
    id: Number(post?.id ?? Date.now()),
    username: post?.username || '',
    name: post?.displayName || post?.username || 'Vivid User',
    avatar: post?.avatar || 'https://ui-avatars.com/api/?name=Vivid+User&background=800020&color=FFFDD0&bold=true',
    photo: post?.photo || '',
    online: true,
    timestamp: formatFeedTimestamp(post?.createdAt || new Date().toISOString()),
    caption: post?.caption || '',
    createdAt: post?.createdAt || new Date().toISOString(),
  });

  const loadFeedFromServer = async () => {
    if (!user?.token) {
      return [];
    }

    try {
      const response = await fetch(`/api/feed?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Feed API error: ${response.status} - ${errText}`);
      }

      const payload = await response.json();
      const posts = Array.isArray(payload?.posts) ? payload.posts : [];
      const mapped = posts.map(mapFeedItem).filter((item: any) => Boolean(item.photo));

      if (mapped.length) {
        setFeedPhotos(mapped);
        setCurrentHomePhotoId(mapped[0].id);
      }

      return mapped;
    } catch (error) {
      console.warn('Không thể tải feed từ máy chủ.', error);
      return [];
    }
  };

  const loadSummariesFromServer = async () => {
    if (!user?.token) {
      setSummaryItems([]);
      return [];
    }

    try {
      const response = await fetch(`/api/summaries?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Summaries API error: ${response.status} - ${errText}`);
      }

      const payload = await response.json();
      const rows = Array.isArray(payload?.summaries) ? payload.summaries : [];

      const toPeriod = (item: any) => {
        const type = item?.type;
        const dateString = String(item?.dateString || '');
        const createdAt = new Date(item?.createdAt || Date.now());

        if (type === 'day') {
          const dayMatch = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
          if (dayMatch) {
            return `Ngày ${Number(dayMatch[3])} tháng ${Number(dayMatch[2])}`;
          }
          return `Ngày ${dateString}`;
        }

        if (type === 'week') {
          const weekMatch = dateString.match(/^(\d{4})-W(\d{1,2})$/);
          if (weekMatch) {
            return `Tuần ${Number(weekMatch[2])} tháng ${createdAt.getMonth() + 1}`;
          }
          return dateString ? `Tuần ${dateString}` : 'Tổng kết tuần';
        }

        if (type === 'month') {
          const monthMatch = dateString.match(/^(\d{4})-(\d{1,2})$/);
          if (monthMatch) {
            return `Tháng ${Number(monthMatch[2])} năm ${monthMatch[1]}`;
          }
          return dateString ? `Tháng ${dateString}` : 'Tổng kết tháng';
        }

        return 'Tổng kết';
      };

      const mapped = rows
        .map((item: any, index: number) => ({
          id: Number(item?.id) || Date.now() + index,
          type: item?.type,
          period: toPeriod(item),
          author: 'Bạn',
          content: item?.text || '',
          isPublic: true,
          date: String(item?.dateString || ''),
        }))
        .filter((item: any) => ['day', 'week', 'month'].includes(item.type) && Boolean(item.content));

      setSummaryItems(mapped);

      return mapped;
    } catch (error) {
      console.warn('Không thể tải tổng kết từ máy chủ.', error);
      setSummaryItems([]);
      return [];
    }
  };

  const historyPhotos = feedPhotos.map((photo: any) => {
    const createdAt = new Date(photo.createdAt || new Date().toISOString());
    const isCurrentUser = Boolean(user?.username) && photo.username === user.username;

    return {
      id: photo.id,
      photo: photo.photo,
      sender: photo.name,
      photographer: isCurrentUser ? 'Bạn' : photo.name,
      date: createdAt.toISOString().slice(0, 10),
      time: createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      caption: photo.caption,
    };
  });

  const historyFriends = Array.from(
    new Map(
      feedPhotos
        .filter((photo: any) => !(Boolean(user?.username) && photo.username === user.username))
        .map((photo: any) => [photo.name, { id: photo.id, name: photo.name, avatar: photo.avatar }]),
    ).values(),
  );

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setSelectedRecipients(friends.map((friend: any) => friend.id));
  };

  const handleSend = async () => {
    if (!capturedImage) {
      alert('Chưa có ảnh để gửi.');
      return;
    }

    if (!user?.username || !user?.token) {
      alert('Phiên đăng nhập đã cũ hoặc hết hạn. Vui lòng đăng nhập lại để gửi ảnh.');
      return;
    }

    if (isSendingPost) {
      return;
    }

    setIsSendingPost(true);

    try {
      const response = await fetch('/api/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          photo: capturedImage,
          caption: caption.trim(),
          recipientIds: selectedRecipients,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const detail = payload?.detail ? `\nChi tiết: ${payload.detail}` : '';
        throw new Error((payload?.message || 'Không thể đăng ảnh lên feed.') + detail);
      }

      await loadFeedFromServer();
      await loadSummariesFromServer();
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      setCapturedImage(null);
      setCaption('');
      setSelectedRecipients([]);
      setShowCamera(false);
    } catch (error: any) {
      alert(error?.message || 'Có lỗi xảy ra khi gửi ảnh.');
    } finally {
      setIsSendingPost(false);
    }
  };

  const toggleRecipient = (id: number) => {
    setSelectedRecipients(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleAllRecipients = () => {
    setSelectedRecipients((prev) => {
      const allRecipientIds = friends.map((friend: any) => friend.id);
      const isAllSelected = allRecipientIds.length > 0 && allRecipientIds.every((id: number) => prev.includes(id));

      return isAllSelected ? [] : allRecipientIds;
    });
  };

  const toggleHomeLike = (id: number) => {
    setLikedPhotoIds((prev) =>
      prev.includes(id) ? prev.filter((photoId) => photoId !== id) : [...prev, id]
    );
  };

  const handleDeleteFeedPhoto = async (photoId: number) => {
    if (!user?.token) {
      throw new Error('Phiên đăng nhập đã cũ hoặc hết hạn. Vui lòng đăng nhập lại.');
    }

    const response = await fetch('/api/feed', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ postId: photoId }),
    });

    const payload = await response.json();
    if (!response.ok) {
      const detail = payload?.detail ? `\nChi tiết: ${payload.detail}` : '';
      throw new Error((payload?.message || 'Không thể xóa ảnh.') + detail);
    }

    await loadFeedFromServer();
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowNotification(true), 1000);
    const hideTimer = setTimeout(() => setShowNotification(false), 4000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    loadFeedFromServer();
    loadSummariesFromServer();

  }, [user?.token]);

  useEffect(() => {
    const validNames = new Set(['Bạn', ...historyFriends.map((friend: any) => friend.name)]);

    if (!validNames.has(selectedFriend)) {
      setSelectedFriend('Bạn');
    }
  }, [historyFriends, selectedFriend]);

  return (
    <ProtectedRoute>
      <div
        className="theme-vivid relative flex min-h-dvh items-center justify-center overflow-hidden p-2 sm:p-4"
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
                <UserAuth onOpenAccount={() => setActiveTab('account')} />
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
                      photos={feedPhotos}
                      currentUsername={user?.username || ''}
                      activePhotoId={currentHomePhotoId}
                      likedPhotoIds={likedPhotoIds}
                      onActivePhotoChange={setCurrentHomePhotoId}
                      onLike={toggleHomeLike}
                      onDeletePhoto={handleDeleteFeedPhoto}
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
                      photos={historyPhotos}
                      filter={historyFilter}
                      onFilterChange={setHistoryFilter}
                      friends={historyFriends}
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
                      summaries={summaryItems}
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
                {activeTab === 'account' && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full"
                  >
                    <AccountPage onBack={() => setActiveTab('home')} />
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
                  isSendingPost={isSendingPost}
                  friends={friends}
                  selectedRecipients={selectedRecipients}
                  onToggleRecipient={toggleRecipient}
                  onToggleAllRecipients={toggleAllRecipients}
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
    </ProtectedRoute>
  );
}

function HomeScreen({ photos, currentUsername, activePhotoId, likedPhotoIds, onActivePhotoChange, onLike, onDeletePhoto, onCameraClick }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const [deletePromptPhotoId, setDeletePromptPhotoId] = useState<number | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const activePhoto = photos.find((item: any) => item.id === activePhotoId) ?? photos[0];
  const liked = likedPhotoIds.includes(activePhoto.id);
  const actionBoxHeight = 92;
  const actionBoxBottomOffset = 30;
  const cardToActionGap = -34;
  const scrollViewportBottom = actionBoxHeight + actionBoxBottomOffset + cardToActionGap;

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    let ticking = false;

    const updateActivePhoto = () => {
      const viewportHeight = container.clientHeight;
      const centerLine = container.scrollTop + viewportHeight / 2;
      const sections = Array.from(container.querySelectorAll<HTMLElement>('[data-home-photo-id]'));

      if (!sections.length) {
        return;
      }

      let closestId = activePhotoId;
      let closestDistance = Number.POSITIVE_INFINITY;

      sections.forEach((section) => {
        const top = section.offsetTop;
        const sectionCenter = top + section.offsetHeight / 2;
        const distance = Math.abs(sectionCenter - centerLine);
        const photoId = Number(section.dataset.homePhotoId);

        if (distance < closestDistance && !Number.isNaN(photoId)) {
          closestDistance = distance;
          closestId = photoId;
        }
      });

      if (closestId !== activePhotoId) {
        onActivePhotoChange(closestId);
      }
    };

    updateActivePhoto();

    const handleScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      requestAnimationFrame(() => {
        updateActivePhoto();
        ticking = false;
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [activePhotoId, onActivePhotoChange]);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        window.clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const startLongPress = (photo: any, isActive: boolean) => {
    const isOwnActivePhoto = isActive && Boolean(currentUsername) && photo.username === currentUsername;
    if (!isOwnActivePhoto) {
      return;
    }

    clearLongPressTimer();
    longPressTimerRef.current = window.setTimeout(() => {
      setDeletePromptPhotoId(photo.id);
    }, 560);
  };

  const handleDeletePhoto = async (photo: any) => {
    if (deletingPhotoId) {
      return;
    }

    setDeletingPhotoId(photo.id);

    try {
      await onDeletePhoto(photo.id);
      setDeletePromptPhotoId(null);
    } catch (error: any) {
      alert(error?.message || 'Không thể xóa ảnh lúc này.');
    } finally {
      setDeletingPhotoId(null);
    }
  };

  return (
    <div className="relative h-full overflow-hidden">
      <div
        ref={scrollRef}
        className="absolute inset-x-0 top-0 overflow-y-auto snap-y snap-mandatory px-4"
        style={{
          bottom: `${scrollViewportBottom}px`,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          overscrollBehavior: 'contain',
          paddingTop: '1.5rem',
        }}
      >
        {photos.map((photo: any, index: number) => {
          const isActive = photo.id === activePhoto.id;
          const isOwnActivePhoto = isActive && Boolean(currentUsername) && photo.username === currentUsername;
          const showDeletePrompt = deletePromptPhotoId === photo.id && isOwnActivePhoto;

          return (
            <section
              key={photo.id}
              data-home-photo-id={photo.id}
              className="snap-center snap-always h-full flex items-start justify-center overflow-hidden"
            >
              <motion.article
                initial={{ opacity: 0, y: 28 }}
                animate={{
                  opacity: isActive ? 1 : 0.72,
                  y: 0,
                  scale: isActive ? 1 : 0.92
                }}
                transition={{ delay: index * 0.05, duration: 0.28 }}
                className="relative mt-8 w-full max-w-[332px]"
              >
                <div
                  className="relative aspect-[4/5] overflow-hidden rounded-[2rem]"
                  onMouseDown={() => startLongPress(photo, isActive)}
                  onMouseUp={clearLongPressTimer}
                  onMouseLeave={clearLongPressTimer}
                  onTouchStart={() => startLongPress(photo, isActive)}
                  onTouchEnd={clearLongPressTimer}
                  onTouchCancel={clearLongPressTimer}
                  style={{
                    border: isActive ? '4px solid var(--tet-gold)' : '2px solid rgba(200, 160, 90, 0.45)'
                  }}
                >
                  <img src={photo.photo} alt={photo.name} className="h-full w-full object-cover" />

                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(to top, rgba(47, 23, 21, 0.82) 0%, rgba(47, 23, 21, 0.08) 46%, rgba(47, 23, 21, 0.18) 100%)'
                  }} />

                  {showDeletePrompt && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeletePhoto(photo);
                        }}
                        disabled={Boolean(deletingPhotoId)}
                        className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-2xl"
                        style={{
                          background: 'rgba(161, 45, 58, 0.92)',
                          border: '2px solid var(--tet-gold)',
                          color: 'var(--tet-cream)',
                          opacity: deletingPhotoId ? 0.8 : 1,
                        }}
                      >
                        <Trash2 size={18} />
                        {deletingPhotoId ? 'Đang xóa...' : 'Xóa ảnh'}
                      </motion.button>
                    </div>
                  )}

                  <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                    <div
                      className="rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm"
                      style={{
                        background: 'rgba(248, 239, 227, 0.18)',
                        border: '1px solid rgba(248, 239, 227, 0.28)',
                        color: 'var(--tet-cream)'
                      }}
                    >
                      {photo.online ? 'Đang hoạt động' : 'Vừa cập nhật'}
                    </div>
                    <div
                      className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm"
                      style={{
                        background: 'rgba(161, 45, 58, 0.38)',
                        border: '1px solid rgba(248, 239, 227, 0.2)',
                        color: 'var(--tet-cream)'
                      }}
                    >
                      <div className="h-2 w-2 rounded-full" style={{ background: 'var(--tet-gold)' }} />
                      {photo.timestamp}
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className="h-12 w-12 overflow-hidden rounded-full"
                        style={{ border: '2px solid var(--tet-gold)' }}
                      >
                        <img src={photo.avatar} alt={photo.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold" style={{ color: 'var(--tet-cream)' }}>{photo.name}</p>
                      </div>
                    </div>

                    {photo.caption && (
                      <div
                        className="rounded-2xl px-4 py-3 backdrop-blur-sm"
                        style={{
                          background: 'rgba(248, 239, 227, 0.12)',
                          border: '1px solid rgba(248, 239, 227, 0.18)'
                        }}
                      >
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--tet-cream)' }}>
                          {photo.caption}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            </section>
          );
        })}
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 z-10 mx-auto w-full max-w-[332px]"
        style={{
          bottom: `${actionBoxHeight + actionBoxBottomOffset - 8}px`,
          height: '1px',
          background: 'linear-gradient(90deg, rgba(161, 45, 58, 0), rgba(161, 45, 58, 0.34), rgba(161, 45, 58, 0))'
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 z-20 px-5"
        style={{ bottom: `${actionBoxBottomOffset}px` }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto mx-auto flex h-[92px] w-full max-w-[332px] items-center rounded-[1.75rem] px-4 shadow-2xl"
          style={{
            background: 'rgba(248, 239, 227, 0.94)',
            border: '1px solid rgba(161, 45, 58, 0.14)',
            backdropFilter: 'blur(14px)'
          }}
        >
          <div className="flex w-full items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => onLike(activePhoto.id)}
              className="flex-1 rounded-full px-5 py-3 flex items-center justify-center gap-2 shadow-lg transition-all"
              style={{
                background: liked ? 'var(--tet-gold)' : 'var(--tet-red)',
                border: '2px solid var(--tet-gold)',
                color: 'var(--tet-cream)'
              }}
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
              <span className="font-medium">{liked ? 'Đã thích' : 'Thích'}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onCameraClick}
              className="flex-1 rounded-full px-4 py-3 flex items-center justify-center gap-2 whitespace-nowrap shadow-lg transition-all"
              style={{
                background: 'white',
                border: '2px solid var(--tet-red)',
                color: 'var(--tet-red)'
              }}
            >
              <Camera size={20} />
              <span className="font-medium">Chụp ảnh</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CameraScreen({ capturedImage, onCapture, onSend, isSendingPost, friends, selectedRecipients, onToggleRecipient, onToggleAllRecipients, caption, onCaptionChange, onBack }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const allSelected = friends.length > 0 && friends.every((friend: any) => selectedRecipients.includes(friend.id));

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
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleAllRecipients}
          className="flex-shrink-0 relative"
        >
          <div
            className="w-14 h-14 rounded-full overflow-hidden transition-all flex items-center justify-center"
            style={{
              border: allSelected
                ? '3px solid var(--tet-red)'
                : '2px solid var(--tet-gold)',
              opacity: allSelected ? 1 : 0.6,
              background: allSelected ? 'var(--tet-red)' : 'white',
              color: allSelected ? 'var(--tet-cream)' : 'var(--tet-red)'
            }}
          >
            <Check size={20} />
          </div>
          <p className="text-xs mt-1 text-center" style={{ color: 'var(--tet-black)' }}>Tất cả</p>
        </motion.button>

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
      <div className="flex-1 rounded-3xl overflow-hidden mb-4" style={{ border: '3px solid var(--tet-gold)' }}>
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
          disabled={selectedRecipients.length === 0 || isSendingPost}
          className="flex-1 py-4 rounded-full font-medium shadow-lg transition-opacity"
          style={{
            background: selectedRecipients.length > 0 && !isSendingPost ? 'var(--tet-red)' : '#ccc',
            border: '2px solid var(--tet-gold)',
            color: 'var(--tet-cream)',
            opacity: selectedRecipients.length > 0 && !isSendingPost ? 1 : 0.5
          }}
        >
          {isSendingPost ? 'Đang gửi...' : 'Gửi'}
        </motion.button>
      </div>
    </div>
  );
}

function HistoryScreen({ photos, filter, onFilterChange, friends, selectedFriend, onFriendChange }: any) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

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
                  className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
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
            className="relative rounded-2xl overflow-hidden aspect-square"
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
    <img src="/vivid-logo.svg" alt="vivid logo" width="40" height="40" />
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
