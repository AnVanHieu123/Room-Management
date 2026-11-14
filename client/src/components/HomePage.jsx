import { useEffect, useState, useCallback } from 'react';
import { Spin, Pagination, Empty, Tabs } from 'antd';
import { MapPin, X, Building2, Sparkles, TrendingUp, Clock, Filter } from 'lucide-react';
import { getAllRoomUser, getFilterOptions } from '../config/RoomRequest';
import Cardbody from './Cardbody';
import FilterSidebar from './FilterSidebar';
import { Link, useSearchParams } from 'react-router-dom';

function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlSearch = searchParams.get('search') || '';

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterOptions, setFilterOptions] = useState({ locations: [], categories: [], newListings: [] });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [filters, setFilters] = useState({
        minPrice: null,
        maxPrice: null,
        minArea: null,
        maxArea: null,
        location: null,
        categoryId: null,
        search: null,
    });
    const [sortTab, setSortTab] = useState('newest');

    const fetchRooms = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getAllRoomUser({
                page: pagination.page,
                limit: pagination.limit,
                ...filters,
            });
            setRooms(res.metadata || []);
            setPagination((prev) => ({
                ...prev,
                total: res.pagination?.total || 0,
                totalPages: res.pagination?.totalPages || 0,
            }));
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, filters]);

    const fetchFilterOptions = async () => {
        try {
            const res = await getFilterOptions();
            setFilterOptions(res.metadata || { locations: [], categories: [], newListings: [] });
        } catch (error) {
            console.error('Error fetching filter options:', error);
        }
    };

    useEffect(() => {
        setFilters((prev) => {
            if (prev.search === (urlSearch || null)) return prev;
            return {
                ...prev,
                search: urlSearch || null,
            };
        });
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, [urlSearch]);

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    const handleFilterChange = (newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (page, pageSize) => {
        setPagination((prev) => ({ ...prev, page, limit: pageSize }));
    };

    const handleLocationClick = (location) => {
        if (filters.location === location) {
            setFilters((prev) => ({ ...prev, location: null }));
        } else {
            setFilters((prev) => ({ ...prev, location }));
        }
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleRoomClick = (room) => {
        console.log('Room clicked:', room);
        // TODO: Navigate to room detail page
    };

    const clearAllFilters = () => {
        setFilters({
            minPrice: null,
            maxPrice: null,
            minArea: null,
            maxArea: null,
            location: null,
            categoryId: null,
            search: null,
        });
        setSearchParams({});
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const hasActiveFilters = Object.values(filters).some((value) => value !== null);

    const getFilterSummary = () => {
        const parts = [];
        if (filters.search) {
            parts.push(`"${filters.search}"`);
        }
        if (filters.minPrice || filters.maxPrice) {
            if (filters.minPrice && filters.maxPrice) {
                parts.push(
                    `Giá ${(filters.minPrice / 1000000).toFixed(0)} - ${(filters.maxPrice / 1000000).toFixed(0)} triệu`,
                );
            } else if (filters.minPrice) {
                parts.push(`Giá từ ${(filters.minPrice / 1000000).toFixed(0)} triệu`);
            } else {
                parts.push(`Giá dưới ${(filters.maxPrice / 1000000).toFixed(0)} triệu`);
            }
        }
        if (filters.location) parts.push(filters.location);
        return parts.join(' · ');
    };

    const sortTabs = [
        { key: 'newest', label: 'Mới đăng', icon: <Clock className="w-4 h-4" /> },
        { key: 'featured', label: 'Đề xuất', icon: <Sparkles className="w-4 h-4" /> },
        { key: 'price_asc', label: 'Giá thấp', icon: <TrendingUp className="w-4 h-4 rotate-180" /> },
        { key: 'price_desc', label: 'Giá cao', icon: <TrendingUp className="w-4 h-4" /> },
    ];

    return (
        <div className="py-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-800">
                            {hasActiveFilters ? (
                                <>
                                    Cho thuê Phòng trọ <span className="text-orange-500">{getFilterSummary()}</span>
                                </>
                            ) : (
                                <>
                                    Cho thuê <span className="text-orange-500">Phòng trọ</span>
                                </>
                            )}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Có <span className="font-bold text-orange-500">{pagination.total}</span> tin đăng cho thuê
                        </p>
                    </div>
                </div>

                {filters.search && (
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs bg-orange-50 text-orange-700 font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 border border-orange-200 shadow-2xs">
                            <span>Từ khóa tìm kiếm: <strong>"{filters.search}"</strong></span>
                            <button
                                onClick={() => {
                                    const newParams = new URLSearchParams(searchParams);
                                    newParams.delete('search');
                                    setSearchParams(newParams);
                                }}
                                className="hover:text-red-600 cursor-pointer p-0.5"
                                title="Xóa tìm kiếm"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    </div>
                )}
            </div>

            {/* Location Tabs */}
            <div className="bg-white rounded-3xl p-5 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100/50 overflow-x-auto">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-400 flex-shrink-0">
                        <MapPin className="w-5 h-5" />
                        <span className="text-sm font-semibold uppercase tracking-wide">Tỉnh thành</span>
                    </div>
                    <div className="flex gap-3 flex-nowrap">
                        {filterOptions.locations.slice(0, 5).map((loc, index) => (
                            <button
                                key={index}
                                onClick={() => handleLocationClick(loc)}
                                className={`flex flex-col items-center px-6 py-3 rounded-2xl transition-all duration-300 flex-shrink-0 ${
                                    filters.location === loc
                                        ? 'bg-orange-500 text-white shadow-xl shadow-orange-200/50 scale-105'
                                        : 'bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:scale-105 hover:shadow-lg'
                                }`}
                            >
                                <span className="text-[11px] font-medium opacity-80">Phòng trọ</span>
                                <span className="text-[15px] font-bold mt-0.5">{loc}</span>
                            </button>
                        ))}
                        {filterOptions.locations.length > 5 && (
                            <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-orange-50 text-orange-500 font-bold text-sm hover:bg-orange-100 transition-all flex-shrink-0">
                                Tất cả
                                <span className="text-lg">→</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
                {/* Left Column - Listings */}
                <div className="min-w-0">
                    {/* Sort Tabs */}
                    <div className="bg-white rounded-2xl p-2 mb-6 shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100/50 flex items-center justify-between">
                        <div className="flex gap-1">
                            {sortTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setSortTab(tab.key)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                        sortTab === tab.key
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-200/50'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        {hasActiveFilters && (
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-red-200/50 hover:shadow-xl hover:scale-105 transition-all"
                                onClick={clearAllFilters}
                            >
                                <X className="w-4 h-4" />
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>

                    {/* Room Listings */}
                    <div className="min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl shadow-lg">
                                <Spin size="large" />
                                <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
                            </div>
                        ) : rooms.length > 0 ? (
                            <>
                                <div className="space-y-5">
                                    {rooms.map((room) => (
                                        <Link to={`/detail/${room._id}`}>
                                            <Cardbody
                                                key={room._id}
                                                room={room}
                                                onClick={() => handleRoomClick(room)}
                                            />
                                        </Link>
                                    ))}
                                </div>
                                <div className="flex justify-center mt-10 p-6 bg-white rounded-2xl shadow-lg">
                                    <Pagination
                                        current={pagination.page}
                                        pageSize={pagination.limit}
                                        total={pagination.total}
                                        onChange={handlePageChange}
                                        showSizeChanger
                                        pageSizeOptions={['10', '20', '50']}
                                        showTotal={(total, range) => (
                                            <span className="text-gray-500">
                                                <span className="font-bold text-orange-500">
                                                    {range[0]}-{range[1]}
                                                </span>{' '}
                                                của <span className="font-bold text-orange-500">{total}</span> phòng
                                            </span>
                                        )}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl shadow-lg">
                                <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                                    <Building2 className="w-12 h-12 text-orange-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-700 mb-2">
                                    {filters.search ? `Không tìm thấy phòng cho "${filters.search}"` : 'Không tìm thấy phòng'}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {filters.search
                                        ? 'Hãy thử tìm kiếm với từ khóa khác như tên quận, đường hoặc khoảng giá khác'
                                        : 'Thử thay đổi bộ lọc để tìm kiếm phòng phù hợp'}
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-orange-200/50 hover:shadow-xl hover:scale-105 transition-all"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Filters */}
                <div className="hidden lg:block">
                    <div className="sticky top-5">
                        <FilterSidebar
                            filterOptions={filterOptions}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            newListings={filterOptions.newListings}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
