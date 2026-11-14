import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useEffect, useState } from 'react';
import { requestDetailRoom, createBooking } from '../config/RoomRequest';
import { Button, Input, Avatar, Tag, Divider, Modal, DatePicker, InputNumber, message } from 'antd';
import dayjs from 'dayjs';
import { useStore } from '../hooks/useStore';
import { requestCreateComment, requestGetCommentsByHouseId } from '../config/CommentRequest';
import {
    Heart,
    MapPin,
    Maximize2,
    Clock,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    Send,
    Building2,
    Zap,
    Droplets,
    Wifi,
    Car,
    Calendar,
    Star,
    ShieldCheck,
    Home,
    User,
    Sparkles,
    BedDouble,
    WashingMachine,
    Refrigerator,
    ThermometerSun,
} from 'lucide-react';
import { requestCreateFavourite } from '../config/FavouriteRequest';
import { requestGetAllPreviewProduct } from '../config/PreviewProduct';

// Tách CommentItem ra ngoài để tránh re-create khi state thay đổi
const CommentItem = ({
    comment,
    replyTo,
    replyContents,
    setReplyTo,
    setReplyContents,
    handleReplySubmit,
    formatTimeAgo,
}) => (
    <div className="flex gap-3 group">
        <Avatar
            src={comment.userId?.avatar || undefined}
            icon={!comment.userId?.avatar && <User className="w-4 h-4" />}
            className={!comment.userId?.avatar ? '!bg-orange-100 !text-orange-500' : ''}
        />
        <div className="flex-1">
            <div className="bg-gray-50 rounded-2xl p-3 px-4">
                <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-gray-900 text-sm">{comment.userId?.fullName || 'Người dùng'}</p>
                    <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{comment.content}</p>
            </div>

            {/* Reply Button */}
            <button
                onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                className="text-xs text-gray-500 font-medium mt-1 ml-2 hover:text-orange-500 transition-colors opacity-0 group-hover:opacity-100"
            >
                {replyTo === comment._id ? 'Hủy' : 'Phản hồi'}
            </button>

            {/* Reply Input Box */}
            {replyTo === comment._id && (
                <div className="mt-3 flex gap-2">
                    <Input
                        autoFocus
                        placeholder={`Trả lời ${comment.userId?.fullName || 'người dùng'}...`}
                        value={replyContents[comment._id] || ''}
                        onChange={(e) => setReplyContents((prev) => ({ ...prev, [comment._id]: e.target.value }))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleReplySubmit(comment._id);
                            }
                        }}
                        className="!rounded-full !py-2 !px-4 !text-sm"
                    />
                    <Button
                        type="text"
                        onClick={() => handleReplySubmit(comment._id)}
                        className="!w-10 !h-10 !rounded-full !flex !items-center !justify-center hover:!bg-orange-50"
                        icon={<Send className="w-4 h-4 text-orange-500" />}
                    />
                </div>
            )}

            {/* Sub-comments (Replies) */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 pl-3 space-y-3 border-l-2 border-gray-100 ml-3">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            replyTo={replyTo}
                            replyContents={replyContents}
                            setReplyTo={setReplyTo}
                            setReplyContents={setReplyContents}
                            handleReplySubmit={handleReplySubmit}
                            formatTimeAgo={formatTimeAgo}
                        />
                    ))}
                </div>
            )}
        </div>
    </div>
);

function DetailRoom() {
    const { id } = useParams();
    const { dataUser } = useStore();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [dataComment, setDataComment] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyContents, setReplyContents] = useState({});

    // Booking modal states
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [rentMonths, setRentMonths] = useState(6);

    const [dataFeedback, setDataFeedback] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await requestDetailRoom(id);
                const res2 = await requestGetCommentsByHouseId(id);
                const res3 = await requestGetAllPreviewProduct();
                if (res.metadata) {
                    setRoom(res.metadata);
                }
                if (res2.metadata) {
                    setDataComment(res2.metadata);
                }
                if (res3.metadata) {
                    setDataFeedback(res3.metadata);
                }
            } catch (error) {
                console.error('Error fetching room detail:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const formatPrice = (price) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)} triệu`;
        }
        return `${price?.toLocaleString('vi-VN')}đ`;
    };

    const formatPriceDetail = (price) => {
        return price?.toLocaleString('vi-VN') || '0';
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const created = new Date(date);
        const diffInMinutes = Math.floor((now - created) / (1000 * 60));

        if (diffInMinutes < 1) return 'Vừa đăng';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ngày trước`;
        return `${Math.floor(diffInDays / 7)} tuần trước`;
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? (room?.images?.length || 1) - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === (room?.images?.length || 1) - 1 ? 0 : prev + 1));
    };

    const getUtilityIcon = (utility) => {
        const iconMap = {
            'Nóng lạnh': <ThermometerSun className="w-5 h-5" />,
            Giường: <BedDouble className="w-5 h-5" />,
            'Máy giặt': <WashingMachine className="w-5 h-5" />,
            'Tủ lạnh': <Refrigerator className="w-5 h-5" />,
        };
        return iconMap[utility] || <Sparkles className="w-5 h-5" />;
    };

    const getBuildingAmenityIcon = (amenity) => {
        const iconMap = {
            'Bảo vệ 24/7': <ShieldCheck className="w-5 h-5" />,
            'Thang máy': <Building2 className="w-5 h-5" />,
            'Bãi đỗ xe': <Car className="w-5 h-5" />,
        };
        return iconMap[amenity] || <Home className="w-5 h-5" />;
    };

    // Booking handlers
    const openBookingModal = () => {
        if (!dataUser?._id) {
            message.warning('Vui lòng đăng nhập để đặt phòng!');
            return;
        }
        setStartDate(null);
        setRentMonths(room?.minContractMonths || 6);
        setIsBookingModalOpen(true);
    };

    const handleBooking = async () => {
        if (!startDate) {
            message.error('Vui lòng chọn ngày bắt đầu thuê!');
            return;
        }
        if (!rentMonths || rentMonths < (room?.minContractMonths || 1)) {
            message.error(`Thời gian thuê tối thiểu là ${room?.minContractMonths || 1} tháng!`);
            return;
        }

        try {
            setBookingLoading(true);
            await createBooking({
                roomId: id,
                startDate: startDate.toISOString(),
                rentMonths: rentMonths,
            });
            message.success('Đặt phòng thành công! Vui lòng chờ xác nhận từ chủ nhà.');
            setIsBookingModalOpen(false);
        } catch (error) {
            console.error('Booking error:', error);
            message.error(error?.response?.data?.message || 'Đặt phòng thất bại!');
        } finally {
            setBookingLoading(false);
        }
    };

    // Calculate estimated total
    const calculateEstimatedTotal = () => {
        if (!room) return { deposit: 0, firstMonth: 0, total: 0 };
        const deposit = room.deposit || 0;
        const firstMonth = room.price || 0;
        return {
            deposit,
            firstMonth,
            total: deposit + firstMonth,
        };
    };

    const handleAddFavourite = async () => {
        try {
            const data = {
                productId: id,
            };
            await requestCreateFavourite(data);
            message.success('Thêm vào yêu thích thành công!');
        } catch (error) {
            console.error('Add favourite error:', error);
            message.error(error?.response?.data?.message || 'Thêm vào yêu thích thất bại!');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        if (!dataUser) {
            message.error('Vui lòng đăng nhập để bình luận');
            return;
        }

        if (!newComment.trim()) {
            message.error('Vui lòng nhập nội dung bình luận');
            return;
        }

        try {
            const data = {
                houseId: id,
                type: 'comment',
                fromUser: dataUser._id,
                message: `${dataUser.fullName} đã bình luận bài viết ${room.nameHouse}`,
            };
            await requestCreateComment({ houseId: id, content: newComment });
            // await requestCreateNotification(data);
            const getComments = await requestGetCommentsByHouseId(id);
            setDataComment(getComments.metadata || []);
            setNewComment('');
            message.success('Đã thêm bình luận');
        } catch (error) {
            console.log(error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleReplySubmit = async (parentId) => {
        if (!dataUser) {
            message.error('Vui lòng đăng nhập để trả lời');
            return;
        }
        const content = replyContents[parentId] || '';
        if (!content.trim()) {
            message.error('Vui lòng nhập nội dung trả lời');
            return;
        }
        try {
            await requestCreateComment({ houseId: id, content: content, parent: parentId });
            const getComments = await requestGetCommentsByHouseId(id);
            setDataComment(getComments.metadata || []);
            setReplyContents((prev) => ({ ...prev, [parentId]: '' }));
            setReplyTo(null);
            message.success('Đã thêm trả lời');
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <Home className="w-16 h-16 text-gray-300" />
                    <p className="text-gray-500 text-lg">Không tìm thấy thông tin phòng</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="w-[90%] max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                            {/* Main Image */}
                            <div className="relative aspect-[16/10] bg-gray-100">
                                <img
                                    src={`${import.meta.env.VITE_API_URL}${room.images?.[currentImageIndex]}`}
                                    alt={room.title}
                                    className="w-full h-full object-cover"
                                />

                                {/* Navigation Arrows */}
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-all"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-all"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>

                                {/* Image Counter */}
                                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                                    {currentImageIndex + 1} / {room.images?.length || 0}
                                </div>
                            </div>

                            {/* Thumbnail Gallery */}
                            <div className="p-4 flex gap-2 overflow-x-auto">
                                {room.images?.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                            currentImageIndex === index
                                                ? 'border-orange-500 shadow-lg shadow-orange-200/50'
                                                : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}${img}`}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Room Info Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                            {/* Category Tag */}
                            {room.categoryId?.nameCategory && (
                                <Tag className="!bg-orange-500 !text-white !border-none !rounded-full !px-4 !py-1 !font-semibold !text-sm flex items-center gap-1 w-fit">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {room.categoryId.nameCategory}
                                </Tag>
                            )}

                            {/* Title */}
                            <div className="flex items-start justify-between gap-4">
                                <h1 className="text-2xl font-bold text-gray-800 leading-tight">{room.title}</h1>
                                <button
                                    onClick={() => handleAddFavourite()}
                                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                                        isFavorite
                                            ? 'bg-red-50 border-red-500 text-red-500'
                                            : 'border-gray-200 text-gray-400 hover:border-red-500 hover:text-red-500'
                                    }`}
                                >
                                    <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500' : ''}`} />
                                </button>
                            </div>

                            {/* Price and Area */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-orange-500">
                                        {formatPrice(room.price)}
                                    </span>
                                    <span className="text-gray-400 font-medium">/tháng</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                                    <Maximize2 className="w-5 h-5 text-orange-500" />
                                    <span className="font-semibold text-gray-700">{room.area} m²</span>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-gray-700 font-medium">{room.address}</p>
                                </div>
                            </div>
                            <iframe
                                className="mb-4"
                                src={`https://www.google.com/maps?q=${encodeURIComponent(room.address)}&output=embed`}
                                width="100%"
                                height="250"
                                style={{ border: 0, borderRadius: '8px' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Property Location"
                            />

                            {/* Time Posted */}
                            <div className="flex items-center gap-2 text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">Cập nhật {formatTimeAgo(room.updatedAt)}</span>
                            </div>
                        </div>

                        {/* Price Details */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-orange-500" />
                                </div>
                                Chi phí hàng tháng
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl border border-yellow-200/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="w-5 h-5 text-yellow-500" />
                                        <span className="text-sm text-gray-600">Điện</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-800">
                                        {formatPriceDetail(room.pricesDetail?.electricity)}đ/kWh
                                    </p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Droplets className="w-5 h-5 text-blue-500" />
                                        <span className="text-sm text-gray-600">Nước</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-800">
                                        {formatPriceDetail(room.pricesDetail?.water)}đ/người
                                    </p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Wifi className="w-5 h-5 text-purple-500" />
                                        <span className="text-sm text-gray-600">Internet</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-800">
                                        {formatPriceDetail(room.pricesDetail?.internet)}đ/tháng
                                    </p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Car className="w-5 h-5 text-green-500" />
                                        <span className="text-sm text-gray-600">Gửi xe</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-800">
                                        {room.pricesDetail?.parking === 0
                                            ? 'Miễn phí'
                                            : `${formatPriceDetail(room.pricesDetail?.parking)}đ/tháng`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Room Details */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <Home className="w-4 h-4 text-orange-500" />
                                </div>
                                Thông tin chi tiết
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Home className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Loại hình</p>
                                        <p className="font-semibold text-gray-700">{room.categoryId?.nameCategory}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Maximize2 className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Diện tích</p>
                                        <p className="font-semibold text-gray-700">{room.area} m²</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Hợp đồng tối thiểu</p>
                                        <p className="font-semibold text-gray-700">{room.minContractMonths} tháng</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Zap className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Tiền cọc</p>
                                        <p className="font-semibold text-gray-700">
                                            {formatPriceDetail(room.deposit)}đ
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Utilities */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-orange-500" />
                                </div>
                                Tiện ích phòng
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {room.utilities?.map((utility, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-full border border-orange-200/50"
                                    >
                                        <span className="text-orange-500">{getUtilityIcon(utility)}</span>
                                        <span className="font-medium text-gray-700">{utility}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Building Amenities */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-orange-500" />
                                </div>
                                Tiện ích tòa nhà
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {room.buildingAmenities?.map((amenity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-full border border-blue-200/50"
                                    >
                                        <span className="text-blue-500">{getBuildingAmenityIcon(amenity)}</span>
                                        <span className="font-medium text-gray-700">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* User Reviews/Feedback Section */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                </div>
                                Đánh giá từ người thuê
                                {dataFeedback?.filter((fb) => fb.roomId?._id === id).length > 0 && (
                                    <span className="text-sm font-normal text-gray-500">
                                        ({dataFeedback?.filter((fb) => fb.roomId?._id === id).length} đánh giá)
                                    </span>
                                )}
                            </h2>

                            {/* Average Rating */}
                            {dataFeedback?.filter((fb) => fb.roomId?._id === id).length > 0 && (
                                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl mb-6">
                                    <div className="text-center">
                                        <p className="text-4xl font-bold text-yellow-500">
                                            {(
                                                dataFeedback
                                                    ?.filter((fb) => fb.roomId?._id === id)
                                                    .reduce((acc, fb) => acc + fb.rating, 0) /
                                                dataFeedback?.filter((fb) => fb.roomId?._id === id).length
                                            ).toFixed(1)}
                                        </p>
                                        <div className="flex items-center justify-center gap-0.5 mt-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-4 h-4 ${
                                                        star <=
                                                        Math.round(
                                                            dataFeedback
                                                                ?.filter((fb) => fb.roomId?._id === id)
                                                                .reduce((acc, fb) => acc + fb.rating, 0) /
                                                                dataFeedback?.filter((fb) => fb.roomId?._id === id)
                                                                    .length,
                                                        )
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-600 text-sm">
                                            Dựa trên{' '}
                                            <span className="font-semibold">
                                                {dataFeedback?.filter((fb) => fb.roomId?._id === id).length}
                                            </span>{' '}
                                            đánh giá từ người đã thuê phòng
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Reviews List */}
                            {dataFeedback?.filter((fb) => fb.roomId?._id === id).length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Star className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 text-sm mb-1">Chưa có đánh giá nào.</p>
                                    <p className="text-gray-400 text-xs">Hãy là người đầu tiên đánh giá phòng này!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {dataFeedback
                                        ?.filter((fb) => fb.roomId?._id === id)
                                        .map((feedback) => (
                                            <div
                                                key={feedback._id}
                                                className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 transition-all"
                                            >
                                                {/* User Info & Rating */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            src={
                                                                feedback.userId?.avatar
                                                                    ? `${import.meta.env.VITE_API_URL}${
                                                                          feedback.userId.avatar
                                                                      }`
                                                                    : undefined
                                                            }
                                                            icon={
                                                                !feedback.userId?.avatar && <User className="w-4 h-4" />
                                                            }
                                                            className={
                                                                !feedback.userId?.avatar
                                                                    ? '!bg-orange-100 !text-orange-500'
                                                                    : ''
                                                            }
                                                            size={40}
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-gray-800">
                                                                {feedback.userId?.fullName || 'Người dùng'}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {formatTimeAgo(feedback.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 rounded-full">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`w-4 h-4 ${
                                                                    star <= feedback.rating
                                                                        ? 'text-yellow-400 fill-yellow-400'
                                                                        : 'text-gray-300'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Comment */}
                                                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                                    {feedback.comment}
                                                </p>

                                                {/* Images */}
                                                {feedback.images?.length > 0 && (
                                                    <div className="flex gap-2 flex-wrap">
                                                        {feedback.images.map((img, index) => (
                                                            <div
                                                                key={index}
                                                                className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
                                                            >
                                                                <img
                                                                    src={`${
                                                                        import.meta.env.VITE_API_URL
                                                                    }/uploads/feedback/${img}`}
                                                                    alt={`Review image ${index + 1}`}
                                                                    className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Mô tả chi tiết</h2>
                            <div
                                className="prose prose-gray max-w-none text-gray-600 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: room.description }}
                            />
                        </div>
                    </div>

                    {/* Right Column - Contact & Comments */}
                    <div className="space-y-6">
                        {/* Owner Contact Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                            {/* Owner Info */}
                            <div className="flex items-center gap-4 mb-4">
                                <Avatar size={56} className="!bg-orange-500" icon={<User className="w-6 h-6" />} />
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800">{room.ownerName}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        {room.ownerPhone}
                                    </div>
                                </div>
                                {room.status === 'available' && (
                                    <Tag className="!bg-green-100 !text-green-600 !border-green-200 !font-semibold">
                                        Còn phòng
                                    </Tag>
                                )}
                            </div>

                            {/* Contact Buttons */}
                            <div className="space-y-3 mb-6">
                                <Button
                                    type="primary"
                                    size="large"
                                    className="!w-full !h-12 !bg-orange-500 hover:!bg-orange-600 !border-none !rounded-xl !font-semibold !flex !items-center !justify-center !gap-2"
                                    icon={<Calendar className="w-5 h-5" />}
                                    onClick={openBookingModal}
                                    disabled={room.status !== 'available'}
                                >
                                    {room.status === 'available' ? 'Đặt phòng ngay' : 'Phòng đã được thuê'}
                                </Button>
                            </div>

                            <Divider className="!my-4" />

                            {/* Comments Section */}
                            <div>
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-orange-500" />
                                    Bình luận ({dataComment?.length || 0})
                                </h3>

                                {dataComment?.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                            <MessageCircle className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-gray-500 text-sm mb-1">Chưa có bình luận nào.</p>
                                        <p className="text-gray-400 text-xs">Hãy để lại bình luận cho người bán.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                        {dataComment?.map((comment) => (
                                            <CommentItem
                                                key={comment._id}
                                                comment={comment}
                                                replyTo={replyTo}
                                                replyContents={replyContents}
                                                setReplyTo={setReplyTo}
                                                setReplyContents={setReplyContents}
                                                handleReplySubmit={handleReplySubmit}
                                                formatTimeAgo={formatTimeAgo}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Comment Input */}
                                <div className="mt-4 flex gap-2">
                                    <Input
                                        placeholder="Bình luận..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleCommentSubmit(e);
                                            }
                                        }}
                                        className="!rounded-full !py-2 !px-4"
                                    />
                                    <Button
                                        type="text"
                                        onClick={handleCommentSubmit}
                                        className="!w-10 !h-10 !rounded-full !flex !items-center !justify-center hover:!bg-orange-50"
                                        icon={<Send className="w-5 h-5 text-orange-500" />}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Booking Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Đặt phòng</h3>
                            <p className="text-sm text-gray-500 font-normal">Điền thông tin để đặt phòng</p>
                        </div>
                    </div>
                }
                open={isBookingModalOpen}
                onCancel={() => setIsBookingModalOpen(false)}
                footer={null}
                width={500}
                centered
            >
                <div className="mt-6 space-y-6">
                    {/* Room Summary */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex gap-4">
                            <img
                                src={`${import.meta.env.VITE_API_URL}${room?.images?.[0]}`}
                                alt={room?.title}
                                className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 line-clamp-2 text-sm">{room?.title}</h4>
                                <p className="text-orange-500 font-bold text-lg mt-1">
                                    {formatPrice(room?.price)}/tháng
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày bắt đầu thuê <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            value={startDate}
                            onChange={setStartDate}
                            className="!w-full !h-12 !rounded-xl"
                            placeholder="Chọn ngày bắt đầu"
                            format="DD/MM/YYYY"
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                            size="large"
                        />
                    </div>

                    {/* Rent Months */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số tháng thuê <span className="text-red-500">*</span>
                        </label>
                        <InputNumber
                            value={rentMonths}
                            onChange={setRentMonths}
                            min={room?.minContractMonths || 1}
                            max={36}
                            className="!w-full !h-12 !rounded-xl"
                            size="large"
                            addonAfter="tháng"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Thời gian thuê tối thiểu: {room?.minContractMonths || 1} tháng
                        </p>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="p-4 bg-orange-50 rounded-xl space-y-3">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-orange-500" />
                            Chi phí thanh toán ban đầu
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tiền cọc:</span>
                                <span className="font-semibold text-gray-800">
                                    {formatPriceDetail(calculateEstimatedTotal().deposit)}đ
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tiền phòng tháng đầu:</span>
                                <span className="font-semibold text-gray-800">
                                    {formatPriceDetail(calculateEstimatedTotal().firstMonth)}đ
                                </span>
                            </div>
                            <Divider className="!my-2" />
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-800">Tổng cộng:</span>
                                <span className="font-bold text-orange-500 text-lg">
                                    {formatPriceDetail(calculateEstimatedTotal().total)}đ
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="primary"
                        size="large"
                        className="!w-full !h-12 !bg-orange-500 hover:!bg-orange-600 !border-none !rounded-xl !font-semibold"
                        onClick={handleBooking}
                        loading={bookingLoading}
                    >
                        Xác nhận đặt phòng
                    </Button>

                    <p className="text-xs text-gray-400 text-center">
                        Bằng việc đặt phòng, bạn đồng ý với các điều khoản sử dụng của chúng tôi
                    </p>
                </div>
            </Modal>
        </div>
    );
}

export default DetailRoom;
