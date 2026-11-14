import { useState, useEffect } from 'react';
import { Button, Empty, Tag, Popconfirm, message } from 'antd';
import { Heart, MapPin, Maximize2, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { requestGetFavouriteByUserId } from '../../config/FavouriteRequest';

const UserSavedRooms = () => {
    const navigate = useNavigate();

    // Mock data - replace with API call later
    const [savedRooms, setSavedRooms] = useState([]);

    const formatPrice = (price) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)} triệu`;
        }
        return `${price?.toLocaleString('vi-VN')}đ`;
    };

    useEffect(() => {
        const fetchData = async () => {
            const res = await requestGetFavouriteByUserId();
            setSavedRooms(res.metadata);
        };
        fetchData();
    }, []);

    const handleRemove = (id) => {
        try {
        } catch (error) {}
    };

    const handleViewDetail = (id) => {
        navigate(`/detail/${id}`);
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Phòng trọ đã lưu</h1>
                <p className="text-gray-500">Danh sách phòng trọ yêu thích của bạn</p>
            </div>

            {/* Statistics */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-800">{savedRooms.length}</p>
                    <p className="text-gray-500">phòng đã lưu</p>
                </div>
            </div>

            {/* Room Grid */}
            {savedRooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedRooms.map((item) => {
                        const room = item.roomId;
                        if (!room) return null;

                        return (
                            <div
                                key={item._id}
                                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all group"
                            >
                                {/* Image */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={
                                            room.images?.[0]
                                                ? `${import.meta.env.VITE_API_URL}${room.images[0]}`
                                                : '/placeholder.jpg'
                                        }
                                        alt={room.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />

                                    {/* Status Badge */}
                                    <div className="absolute top-3 left-3">
                                        <Tag
                                            color={room.status === 'available' ? 'green' : 'red'}
                                            className="!rounded-full !px-3 !py-1 !font-medium"
                                        >
                                            {room.status === 'available' ? 'Còn phòng' : 'Đã cho thuê'}
                                        </Tag>
                                    </div>

                                    {/* Heart Icon */}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors">
                                        {room.title}
                                    </h3>

                                    {/* Price and Area */}
                                    <div className="flex items-center gap-4 mb-3">
                                        <span className="text-xl font-bold text-orange-500">
                                            {formatPrice(room.price)}
                                            <span className="text-sm text-gray-400 font-normal">/tháng</span>
                                        </span>
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Maximize2 className="w-4 h-4" />
                                            <span>{room.area} m²</span>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="flex items-start gap-2 text-gray-500 text-sm mb-4">
                                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span className="line-clamp-1">{room.address}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            type="primary"
                                            icon={<ExternalLink className="w-4 h-4" />}
                                            onClick={() => handleViewDetail(room._id)}
                                            className="flex-1 !bg-orange-500 hover:!bg-orange-600 !border-none !rounded-xl"
                                        >
                                            Xem chi tiết
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span className="text-gray-500">Bạn chưa lưu phòng trọ nào</span>}
                >
                    <Button
                        type="primary"
                        className="!bg-orange-500 hover:!bg-orange-600 !border-none"
                        onClick={() => navigate('/')}
                    >
                        Khám phá phòng trọ
                    </Button>
                </Empty>
            )}
        </div>
    );
};

export default UserSavedRooms;
