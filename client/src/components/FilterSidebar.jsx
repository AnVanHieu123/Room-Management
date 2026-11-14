import { Card, Divider } from 'antd';
import { MapPin, DollarSign, Maximize2, Home, Sparkles } from 'lucide-react';

const PRICE_RANGES = [
    { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
    { label: '1 - 2 triệu', min: 1000000, max: 2000000 },
    { label: '2 - 3 triệu', min: 2000000, max: 3000000 },
    { label: '3 - 5 triệu', min: 3000000, max: 5000000 },
    { label: '5 - 7 triệu', min: 5000000, max: 7000000 },
    { label: '7 - 10 triệu', min: 7000000, max: 10000000 },
    { label: '10 - 15 triệu', min: 10000000, max: 15000000 },
    { label: 'Trên 15 triệu', min: 15000000, max: null },
];

const AREA_RANGES = [
    { label: 'Dưới 20 m²', min: 0, max: 20 },
    { label: '20 - 30 m²', min: 20, max: 30 },
    { label: '30 - 50 m²', min: 30, max: 50 },
    { label: '50 - 70 m²', min: 50, max: 70 },
    { label: '70 - 90 m²', min: 70, max: 90 },
    { label: 'Trên 90 m²', min: 90, max: null },
];

function FilterSidebar({ filterOptions, filters, onFilterChange, newListings = [] }) {
    const { locations = [], categories = [] } = filterOptions || {};

    const handlePriceClick = (range) => {
        if (filters.minPrice === range.min && filters.maxPrice === range.max) {
            onFilterChange({ minPrice: null, maxPrice: null });
        } else {
            onFilterChange({ minPrice: range.min, maxPrice: range.max });
        }
    };

    const handleAreaClick = (range) => {
        if (filters.minArea === range.min && filters.maxArea === range.max) {
            onFilterChange({ minArea: null, maxArea: null });
        } else {
            onFilterChange({ minArea: range.min, maxArea: range.max });
        }
    };

    const handleLocationClick = (location) => {
        if (filters.location === location) {
            onFilterChange({ location: null });
        } else {
            onFilterChange({ location });
        }
    };

    const handleCategoryClick = (categoryId) => {
        if (filters.categoryId === categoryId) {
            onFilterChange({ categoryId: null });
        } else {
            onFilterChange({ categoryId });
        }
    };

    const formatPrice = (price) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)} triệu`;
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
        return `${Math.floor(diffInDays / 7)} tuần trước`;
    };

    const isPriceActive = (range) => filters.minPrice === range.min && filters.maxPrice === range.max;
    const isAreaActive = (range) => filters.minArea === range.min && filters.maxArea === range.max;

    return (
        <div className="space-y-5">
            {/* Price Filter */}
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100/50 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
                        <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-[15px] font-bold text-gray-800">Xem theo khoảng giá</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {PRICE_RANGES.map((range, index) => (
                        <button
                            key={index}
                            onClick={() => handlePriceClick(range)}
                            className={`px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                                isPriceActive(range)
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-[1.02]'
                                    : 'bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:scale-[1.02]'
                            }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Area Filter */}
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100/50 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
                        <Maximize2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-[15px] font-bold text-gray-800">Xem theo diện tích</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {AREA_RANGES.map((range, index) => (
                        <button
                            key={index}
                            onClick={() => handleAreaClick(range)}
                            className={`px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                                isAreaActive(range)
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-[1.02]'
                                    : 'bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:scale-[1.02]'
                            }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
                <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100/50 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
                            <Home className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-[15px] font-bold text-gray-800">Loại phòng</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => handleCategoryClick(cat._id)}
                                className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${
                                    filters.categoryId === cat._id
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                        : 'bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Location Filter */}
            {locations.length > 0 && (
                <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100/50 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-[15px] font-bold text-gray-800">Khu vực</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {locations.map((loc, index) => (
                            <button
                                key={index}
                                onClick={() => handleLocationClick(loc)}
                                className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${
                                    filters.location === loc
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                        : 'bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                                }`}
                            >
                                {loc}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* New Listings */}
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200 animate-pulse">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-[15px] font-bold text-gray-800">Tin mới đăng</h3>
                </div>
                <div className="space-y-3">
                    {newListings.map((room, index) => (
                        <div
                            key={room._id}
                            className="flex gap-3 p-3 rounded-2xl hover:bg-orange-50 transition-all duration-200 cursor-pointer group"
                        >
                            <div className="relative w-[72px] h-[56px] rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                                <img
                                    src={
                                        room.images?.[0]
                                            ? `${import.meta.env.VITE_API_URL}${room.images[0]}`
                                            : '/placeholder.jpg'
                                    }
                                    alt={room.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                {index === 0 && (
                                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-orange-500 rounded text-[9px] text-white font-bold">
                                        HOT
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                                    {room.title}
                                </h4>
                                <div className="flex items-center justify-between mt-1.5">
                                    <span className="text-[13px] font-bold text-orange-500">
                                        {formatPrice(room.price)}/th
                                    </span>
                                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {formatTimeAgo(room.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default FilterSidebar;
