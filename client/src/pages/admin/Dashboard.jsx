import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Avatar, Spin, Rate } from 'antd';
import { Home, Users, DollarSign, TrendingUp, Building, CheckCircle, Star } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
} from 'recharts';
import { requestGetStatistics } from '../../config/StatisticsRequest';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setLoading(true);
                const res = await requestGetStatistics();
                setStats(res.metadata);
            } catch (error) {
                console.error('Error fetching statistics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStatistics();
    }, []);

    const formatPrice = (price) => {
        if (price >= 1000000000) {
            return `${(price / 1000000000).toFixed(1)} tỷ`;
        }
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)} triệu`;
        }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Spin size="large" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Tổng phòng trọ',
            value: stats?.totalRooms || 0,
            icon: <Home className="text-orange-500" size={24} />,
            bgColor: 'bg-orange-50',
            iconBg: 'bg-orange-100',
        },
        {
            title: 'Phòng đang thuê',
            value: stats?.occupiedRooms || 0,
            icon: <Building className="text-red-500" size={24} />,
            bgColor: 'bg-red-50',
            iconBg: 'bg-red-100',
        },
        {
            title: 'Phòng trống',
            value: stats?.availableRooms || 0,
            icon: <CheckCircle className="text-green-500" size={24} />,
            bgColor: 'bg-green-50',
            iconBg: 'bg-green-100',
        },
        {
            title: 'Tổng người thuê',
            value: stats?.totalTenants || 0,
            icon: <Users className="text-blue-500" size={24} />,
            bgColor: 'bg-blue-50',
            iconBg: 'bg-blue-100',
        },
        {
            title: 'Doanh thu năm',
            value: formatPrice(stats?.yearlyRevenue || 0),
            icon: <TrendingUp className="text-purple-500" size={24} />,
            bgColor: 'bg-purple-50',
            iconBg: 'bg-purple-100',
            suffix: 'đ',
        },
        {
            title: 'Doanh thu tháng này',
            value: formatPrice(stats?.monthlyRevenue || 0),
            icon: <DollarSign className="text-emerald-500" size={24} />,
            bgColor: 'bg-emerald-50',
            iconBg: 'bg-emerald-100',
            suffix: 'đ',
        },
    ];

    const COLORS = ['#f97316', '#22c55e'];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Thống kê tổng quan</h1>
                <p className="text-gray-500 mt-1">Xem tổng quan về hoạt động của hệ thống</p>
            </div>

            {/* Stats Cards */}
            <Row gutter={[16, 16]}>
                {statCards.map((stat, index) => (
                    <Col xs={24} sm={12} lg={8} xl={4} key={index}>
                        <Card
                            className={`${stat.bgColor} border-0 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">{stat.title}</p>
                                    <Statistic
                                        value={stat.value}
                                        suffix={stat.suffix}
                                        valueStyle={{
                                            fontSize: '20px',
                                            fontWeight: 700,
                                            color: '#1f2937',
                                        }}
                                    />
                                </div>
                                <div className={`${stat.iconBg} p-2 rounded-xl`}>{stat.icon}</div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Charts Row 1 */}
            <Row gutter={[24, 24]}>
                {/* Bar Chart - Monthly Revenue */}
                <Col xs={24} lg={16}>
                    <Card
                        title={
                            <span className="text-lg font-semibold text-gray-800">
                                📊 Doanh thu theo tháng ({new Date().getFullYear()})
                            </span>
                        }
                        className="rounded-2xl shadow-sm"
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats?.monthlyRevenueData || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={(value) => formatPrice(value)} tick={{ fontSize: 11 }} />
                                <Tooltip
                                    formatter={(value) => [`${formatPrice(value)}đ`, 'Doanh thu']}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Pie Chart - Room Status */}
                <Col xs={24} lg={8}>
                    <Card
                        title={<span className="text-lg font-semibold text-gray-800">🏠 Tỷ lệ phòng</span>}
                        className="rounded-2xl shadow-sm"
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats?.roomStatusData || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {stats?.roomStatusData?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name) => [`${value} phòng`, name]}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row 2 */}
            <Row gutter={[24, 24]}>
                {/* Line Chart - New Rooms per Month */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <span className="text-lg font-semibold text-gray-800">📈 Phòng đăng mới theo tháng</span>
                        }
                        className="rounded-2xl shadow-sm"
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats?.newRoomsData || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value) => [`${value} phòng`, 'Số phòng mới']}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Recent Feedbacks */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <span className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                Đánh giá gần đây
                            </span>
                        }
                        className="rounded-2xl shadow-sm"
                    >
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                            {stats?.recentFeedbacks?.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">Chưa có đánh giá nào</div>
                            ) : (
                                stats?.recentFeedbacks?.map((feedback) => (
                                    <div
                                        key={feedback._id}
                                        className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 transition-all"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar
                                                src={
                                                    feedback.userId?.avatar
                                                        ? `${import.meta.env.VITE_API_URL}${feedback.userId.avatar}`
                                                        : undefined
                                                }
                                                className="!bg-orange-100 !text-orange-500"
                                            >
                                                {feedback.userId?.fullName?.[0] || 'U'}
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="font-semibold text-gray-800 text-sm truncate">
                                                        {feedback.userId?.fullName || 'Người dùng'}
                                                    </p>
                                                    <Rate
                                                        disabled
                                                        defaultValue={feedback.rating}
                                                        className="!text-xs"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-400 mb-1">
                                                    {feedback.roomId?.title} • {formatTimeAgo(feedback.createdAt)}
                                                </p>
                                                <p className="text-sm text-gray-600 line-clamp-2">{feedback.comment}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
