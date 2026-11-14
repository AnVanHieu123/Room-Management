import { Tag } from 'antd';
import { Heart, MapPin, Maximize2, Camera, Clock, Zap } from 'lucide-react';
import { useState } from 'react';

function Cardbody({ room, onClick }) {
    const [isFavorite, setIsFavorite] = useState(false);

    const formatPrice = (price) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(0)} triệu`;
        }
        return `${price.toLocaleString('vi-VN')}đ`;
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const created = new Date(date);
        const diffInHours = Math.floor((now - created) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Vừa đăng';
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ngày trước`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
        return `${Math.floor(diffInDays / 30)} tháng trước`;
    };

    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        setIsFavorite(!isFavorite);
    };

    const imageUrl = room.images?.[0] ? `${import.meta.env.VITE_API_URL}${room.images[0]}` : '/placeholder.jpg';
    const isNew = new Date() - new Date(room.createdAt) < 24 * 60 * 60 * 1000;

    return (
        <div
            className="bg-white rounded-3xl overflow-hidden transition-all duration-300 border border-gray-100/50 hover:shadow-[0_20px_60px_rgb(0,0,0,0.15)] hover:-translate-y-2 cursor-pointer group shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
            onClick={onClick}
        >
            <div className="flex">
                {/* Image Section */}
                <div className="relative w-[280px] h-[210px] flex-shrink-0 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={room.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Image Count Badge */}
                    {room.images?.length > 1 && (
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 font-medium">
                            <Camera className="w-3.5 h-3.5" />
                            <span>{room.images.length}</span>
                        </div>
                    )}

                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {isNew && (
                            <div className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-lg shadow-orange-200/50">
                                <Zap className="w-3 h-3" />
                                MỚI
                            </div>
                        )}
                        {room.status === 'occupied' && (
                            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-lg">
                                ĐÃ CHO THUÊ
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 p-5 flex flex-col">
                    {/* Title */}
                    <h3 className="text-[17px] font-bold text-gray-800 line-clamp-2 mb-3 group-hover:text-orange-500 transition-colors leading-snug">
                        {room.title}
                    </h3>

                    {/* Price and Area */}
                    <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-extrabold text-orange-500">{formatPrice(room.price)}</span>
                            <span className="text-sm text-gray-400 font-medium">/tháng</span>
                        </div>
                        <div className="w-px h-6 bg-gray-200" />
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                                <Maximize2 className="w-4 h-4 text-orange-500" />
                            </div>
                            <span className="font-semibold">{room.area}</span>
                            <span className="text-sm text-gray-400">m²</span>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <MapPin className="w-4 h-4 text-orange-500" />
                        </div>
                        <span className="text-[14px] text-gray-600 line-clamp-1 leading-relaxed pt-1">
                            {room.address}
                        </span>
                    </div>

                    {/* Description */}
                    <p
                        className="text-[13px] text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: room.description }}
                    />

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-[13px]">{formatTimeAgo(room.createdAt)}</span>
                        </div>
                        {room.categoryId?.nameCategory && (
                            <div className="px-4 py-1.5 bg-orange-50 rounded-full">
                                <span className="text-[12px] font-semibold text-orange-500">
                                    {room.categoryId.nameCategory}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cardbody;
