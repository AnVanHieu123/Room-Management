import { useState, useEffect, useRef } from 'react';
import { Input, Button, Badge, Dropdown, Popover, Empty, Spin } from 'antd';
import {
    Search,
    Heart,
    User,
    Bell,
    ShoppingBag,
    MessageCircle,
    Eye,
    Clock,
    Sparkles,
    Bot,
    X,
    MapPin,
    ArrowRight,
    Shield,
} from 'lucide-react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { getAllRoomUser } from '../config/RoomRequest';
import { requestLogout } from '../config/UserRequest';
import Cookies from 'js-cookie';

function Header() {
    const { dataUser, notification, setDataUser } = useStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [searchValue, setSearchValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchContainerRef = useRef(null);

    const isAdmin = dataUser?.role === 'admin' || dataUser?.isAdmin === true;

    // Đồng bộ searchValue từ query params khi ở trang chủ
    useEffect(() => {
        if (location.pathname === '/') {
            setSearchValue(searchParams.get('search') || '');
        }
    }, [location.pathname, searchParams]);

    // Ẩn dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Live autocomplete gợi ý phòng trọ khi người dùng gõ
    useEffect(() => {
        const trimmed = searchValue.trim();
        if (trimmed.length < 2) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setIsSearching(true);
                const res = await getAllRoomUser({ search: trimmed, limit: 5 });
                setSuggestions(res.metadata || []);
                setShowDropdown(true);
            } catch (error) {
                console.error('Error fetching search suggestions:', error);
            } finally {
                setIsSearching(false);
            }
        }, 280);

        return () => clearTimeout(timer);
    }, [searchValue]);

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        setShowDropdown(false);
        const trimmed = searchValue.trim();
        if (trimmed) {
            navigate(`/?search=${encodeURIComponent(trimmed)}`);
        } else {
            navigate('/');
        }
    };

    const handleClearSearch = () => {
        setSearchValue('');
        setSuggestions([]);
        setShowDropdown(false);
        if (location.pathname === '/' && searchParams.get('search')) {
            navigate('/');
        }
    };

    const getRoomThumb = (room) => {
        if (!room?.images || room.images.length === 0) {
            return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200';
        }
        const img = room.images[0];
        if (img.startsWith('http')) return img;
        return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${img}`;
    };

    const handlerLogout = async () => {
        try {
            await requestLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            Cookies.remove('logged');
            Cookies.remove('token');
            Cookies.remove('refreshToken');
            if (setDataUser) setDataUser({});
            navigate('/login');
        }
    };

    const userMenuItems = [
        ...(isAdmin
            ? [
                  {
                      key: 'admin',
                      label: (
                          <Link to="/admin" className="font-bold text-orange-600 flex items-center gap-1.5">
                              <Shield size={15} /> Trang quản trị (Admin)
                          </Link>
                      ),
                  },
                  { type: 'divider' },
              ]
            : []),
        { key: 'profile', label: <Link to="/user">Trang cá nhân</Link> },
        { key: 'saved', label: <Link to="/user/saved">Tin đã lưu</Link> },
        { key: 'bookings', label: <Link to="/user/bookings">Phòng trọ đã thuê</Link> },
        { type: 'divider' },
        { key: 'logout', label: 'Đăng xuất', danger: true, onClick: handlerLogout },
    ];

    // Format time ago for notifications
    const formatTimeAgo = (date) => {
        const now = new Date();
        const created = new Date(date);
        const diffInMinutes = Math.floor((now - created) / (1000 * 60));

        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ngày trước`;
        return `${Math.floor(diffInDays / 7)} tuần trước`;
    };

    // Get icon by notification type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order':
                return <ShoppingBag className="w-5 h-5 text-orange-500" />;
            case 'comment':
                return <MessageCircle className="w-5 h-5 text-blue-500" />;
            case 'view':
                return <Eye className="w-5 h-5 text-green-500" />;
            case 'favorite':
                return <Heart className="w-5 h-5 text-red-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    // Notification content
    const notificationContent = (
        <div className="w-80 max-h-96 overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">Thông báo</h3>
            </div>
            {notification && notification.length > 0 ? (
                <div className="divide-y divide-gray-100">
                    {notification.map((item) => (
                        <div
                            key={item._id}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                !item.isRead ? 'bg-orange-50/50' : ''
                            }`}
                        >
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    {getNotificationIcon(item.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800 font-medium line-clamp-2">{item.message}</p>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        <span>{formatTimeAgo(item.createdAt)}</span>
                                    </div>
                                </div>
                                {!item.isRead && (
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-8">
                    <Empty description="Không có thông báo" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
            )}
            {notification && notification.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-100 text-center">
                    <Link to="/notifications" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                        Xem tất cả thông báo
                    </Link>
                </div>
            )}
        </div>
    );

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-xs">
            <div className="w-[90%] mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to={'/'} className="flex-shrink-0">
                        <img src="https://static.chotot.com/storage/APP_WRAPPER/logo/pty.png" alt="Phòng trọ" className="h-9 sm:h-10 object-contain" />
                    </Link>

                    {/* Search Bar với Live Autocomplete */}
                    <div className="flex-1 max-w-2xl relative" ref={searchContainerRef}>
                        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                            <Input
                                placeholder="Tìm theo khu vực, tên phòng, địa chỉ... (ví dụ: Cầu Giấy, khép kín)"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onFocus={() => {
                                    if (suggestions.length > 0) setShowDropdown(true);
                                }}
                                className="!rounded-l-full !rounded-r-none !border-gray-300 !py-2.5 !px-5 !text-sm sm:!text-base hover:!border-orange-400 focus:!border-orange-500 !pr-10"
                                size="large"
                                suffix={
                                    searchValue ? (
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 transition-colors"
                                            title="Xóa tìm kiếm"
                                        >
                                            <X size={16} />
                                        </button>
                                    ) : null
                                }
                            />
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="!rounded-l-none !rounded-r-full !bg-orange-500 hover:!bg-orange-600 !border-orange-500 hover:!border-orange-600 !h-[46px] !px-5 sm:!px-6 flex items-center justify-center cursor-pointer shadow-xs"
                                icon={<Search size={20} />}
                            />
                        </form>

                        {/* Dropdown gợi ý kết quả trực tiếp */}
                        {showDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in duration-150">
                                {isSearching ? (
                                    <div className="py-6 flex items-center justify-center gap-2 text-gray-500 text-xs">
                                        <Spin size="small" />
                                        <span>Đang tìm kiếm phòng trọ...</span>
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    <div>
                                        <div className="px-4 py-2.5 bg-orange-50/70 border-b border-orange-100 flex items-center justify-between text-xs text-orange-800 font-semibold">
                                            <span>Phòng trọ phù hợp</span>
                                            <span className="text-[11px] text-gray-400 font-normal">Nhấn Enter để xem tất cả</span>
                                        </div>
                                        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                                            {suggestions.map((room) => {
                                                const thumb = getRoomThumb(room);
                                                const priceText = Number(room.price).toLocaleString('vi-VN') + ' đ/tháng';
                                                return (
                                                    <div
                                                        key={room._id}
                                                        onClick={() => {
                                                            setShowDropdown(false);
                                                            navigate(`/detail/${room._id}`);
                                                        }}
                                                        className="p-3 hover:bg-orange-50/50 cursor-pointer flex items-center gap-3 transition-colors group"
                                                    >
                                                        <img
                                                            src={thumb}
                                                            alt={room.title}
                                                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-200 group-hover:scale-105 transition-transform"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate group-hover:text-orange-600 transition-colors">
                                                                {room.title}
                                                            </p>
                                                            <p className="text-xs font-bold text-orange-600 mt-0.5">
                                                                {priceText}
                                                            </p>
                                                            <p className="text-[11px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                                                                <MapPin size={11} className="flex-shrink-0" />
                                                                <span className="truncate">{room.address}</span>
                                                            </p>
                                                        </div>
                                                        <ArrowRight size={15} className="text-gray-300 group-hover:text-orange-500 flex-shrink-0 transition-colors" />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSearchSubmit}
                                            className="w-full py-2.5 px-4 bg-gray-50 hover:bg-orange-100 text-orange-600 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border-t border-gray-100 cursor-pointer"
                                        >
                                            <span>Xem tất cả kết quả cho "{searchValue}"</span>
                                            <ArrowRight size={13} />
                                        </button>
                                    </div>
                                ) : searchValue.trim().length >= 2 ? (
                                    <div className="p-6 text-center text-xs text-gray-500">
                                        <p className="font-semibold text-gray-700 mb-1">Không tìm thấy phòng trọ nào phù hợp</p>
                                        <p className="text-gray-400">Hãy thử tìm theo tên quận, đường hoặc mức giá khác</p>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2.5">
                        <Link to="/blog" className="text-gray-700 hover:text-orange-500 font-medium text-sm transition-colors">
                            Bài viết
                        </Link>

                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white text-xs font-semibold hover:shadow-md hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all cursor-pointer ring-2 ring-orange-200/50"
                            title="Mở Trợ Lý AI Tìm Phòng Trọ"
                        >
                            <Sparkles size={13} className="text-yellow-200 fill-yellow-200 animate-pulse" />
                            <span className="hidden sm:inline">Tìm phòng AI</span>
                        </button>

                        {/* User Profile / Login */}
                        {dataUser?._id ? (
                            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                                <Button
                                    type="text"
                                    className="!flex !items-center !justify-center !w-10 !h-10 hover:!bg-gray-100 !rounded-full"
                                    icon={<User size={22} className="text-gray-600" />}
                                />
                            </Dropdown>
                        ) : (
                            <Link to={'/login'}>
                                <Button
                                    type="text"
                                    className="!text-gray-700 !font-medium hover:!text-orange-500 !hidden md:!inline-flex"
                                >
                                    Đăng nhập
                                </Button>
                            </Link>
                        )}

                        {/* Notifications */}
                        <Popover
                            content={notificationContent}
                            trigger="click"
                            placement="bottomRight"
                            arrow={false}
                            overlayClassName="notification-popover"
                            overlayInnerStyle={{ padding: 0, borderRadius: '12px', overflow: 'hidden' }}
                        >
                            <Badge count={notification?.filter((n) => !n.isRead).length || 0} size="small">
                                <Button
                                    type="text"
                                    className="!flex !items-center !justify-center !w-10 !h-10 hover:!bg-gray-100 !rounded-full"
                                    icon={<Bell size={22} className="text-gray-600" />}
                                />
                            </Badge>
                        </Popover>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
