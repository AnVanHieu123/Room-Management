import { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
    Space,
    Tag,
    Drawer,
    Descriptions,
    message,
    Popconfirm,
    Avatar,
    Timeline,
    Statistic,
    Card,
    Row,
    Col,
    Select,
    DatePicker,
} from 'antd';
import {
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Calendar,
    User,
    Home,
    DollarSign,
    Clock,
    MapPin,
    Phone,
    RefreshCw,
    Filter,
    FileText,
    CreditCard,
} from 'lucide-react';
import dayjs from 'dayjs';
import { getAllBookings, approveBooking, rejectBooking } from '../../config/BookingRequest';

const { RangePicker } = DatePicker;

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await getAllBookings();
            setBookings(res.metadata || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            message.error('Lỗi khi tải danh sách đặt phòng');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveBooking(id);
            message.success('Đã duyệt đơn đặt phòng!');
            fetchBookings();
            setDrawerOpen(false);
        } catch (error) {
            message.error(error?.response?.data?.message || 'Lỗi khi duyệt đơn');
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectBooking(id);
            message.success('Đã từ chối đơn đặt phòng!');
            fetchBookings();
            setDrawerOpen(false);
        } catch (error) {
            message.error(error?.response?.data?.message || 'Lỗi khi từ chối đơn');
        }
    };

    const formatPrice = (price) => {
        return price?.toLocaleString('vi-VN') || '0';
    };

    const formatDate = (date) => {
        return date ? dayjs(date).format('DD/MM/YYYY') : '-';
    };

    const getApproveStatusTag = (status) => {
        const config = {
            pending: { color: 'orange', text: 'Chờ duyệt' },
            approved: { color: 'green', text: 'Đã duyệt' },
            rejected: { color: 'red', text: 'Từ chối' },
        };
        return <Tag color={config[status]?.color}>{config[status]?.text}</Tag>;
    };

    const getPaymentStatusTag = (status) => {
        const config = {
            waiting_payment: { color: 'default', text: 'Chờ thanh toán' },
            paid_initial: { color: 'blue', text: 'Đã cọc' },
            partial: { color: 'orange', text: 'Thanh toán một phần' },
            full: { color: 'green', text: 'Thanh toán đủ' },
        };
        return <Tag color={config[status]?.color}>{config[status]?.text}</Tag>;
    };

    const getBookingStatusTag = (status) => {
        const config = {
            pending: { color: 'orange', text: 'Chờ xử lý' },
            waiting_payment: { color: 'blue', text: 'Chờ thanh toán' },
            active: { color: 'green', text: 'Đang thuê' },
            cancelled: { color: 'red', text: 'Đã hủy' },
        };
        return <Tag color={config[status]?.color}>{config[status]?.text}</Tag>;
    };

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            booking.roomId?.title?.toLowerCase().includes(searchText.toLowerCase()) ||
            booking.userId?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
            booking.userId?.email?.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === 'all' || booking.approveStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: '_id',
            key: '_id',
            width: 100,
            render: (id) => <span className="font-mono text-xs text-gray-500">#{id?.slice(-6).toUpperCase()}</span>,
        },
        {
            title: 'Phòng',
            dataIndex: 'roomId',
            key: 'room',
            width: 250,
            render: (room) => (
                <div className="flex items-center gap-3">
                    <img
                        src={`${import.meta.env.VITE_API_URL}${room?.images?.[0]}`}
                        alt={room?.title}
                        className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                        <p className="font-medium text-gray-800 line-clamp-1">{room?.title}</p>
                        <p className="text-xs text-gray-500">{formatPrice(room?.price)}đ/tháng</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Người đặt',
            dataIndex: 'userId',
            key: 'user',
            width: 180,
            render: (user) => (
                <div className="flex items-center gap-2">
                    <Avatar size={32} className="!bg-orange-500">
                        {user?.fullName?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <div>
                        <p className="font-medium text-sm">{user?.fullName}</p>
                        <p className="text-xs text-gray-500">{user?.phone}</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
            width: 120,
            render: (date) => (
                <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>{formatDate(date)}</span>
                </div>
            ),
        },
        {
            title: 'Thời gian',
            dataIndex: 'rentMonths',
            key: 'rentMonths',
            width: 100,
            render: (months) => <Tag color="blue">{months} tháng</Tag>,
        },
        {
            title: 'Trạng thái duyệt',
            dataIndex: 'approveStatus',
            key: 'approveStatus',
            width: 130,
            render: (status) => getApproveStatusTag(status),
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            width: 150,
            render: (status) => getPaymentStatusTag(status),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => <span className="text-gray-500">{formatDate(date)}</span>,
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            defaultSortOrder: 'descend',
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => {
                            setSelectedBooking(record);
                            setDrawerOpen(true);
                        }}
                        className="!text-blue-500 hover:!bg-blue-50"
                    />
                    {record.approveStatus === 'pending' && (
                        <>
                            <Popconfirm
                                title="Duyệt đơn đặt phòng"
                                description="Bạn có chắc muốn duyệt đơn này?"
                                onConfirm={() => handleApprove(record._id)}
                                okText="Duyệt"
                                cancelText="Hủy"
                            >
                                <Button
                                    type="text"
                                    icon={<CheckCircle className="w-4 h-4" />}
                                    className="!text-green-500 hover:!bg-green-50"
                                />
                            </Popconfirm>
                            <Popconfirm
                                title="Từ chối đơn đặt phòng"
                                description="Bạn có chắc muốn từ chối đơn này?"
                                onConfirm={() => handleReject(record._id)}
                                okText="Từ chối"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    type="text"
                                    icon={<XCircle className="w-4 h-4" />}
                                    className="!text-red-500 hover:!bg-red-50"
                                />
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    // Statistics
    const stats = {
        total: bookings.length,
        pending: bookings.filter((b) => b.approveStatus === 'pending').length,
        approved: bookings.filter((b) => b.approveStatus === 'approved').length,
        rejected: bookings.filter((b) => b.approveStatus === 'rejected').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý đặt phòng</h1>
                    <p className="text-gray-500">Quản lý các đơn đặt phòng từ khách hàng</p>
                </div>
                <Button
                    type="primary"
                    icon={<RefreshCw className="w-4 h-4" />}
                    onClick={fetchBookings}
                    loading={loading}
                    className="!bg-orange-500 hover:!bg-orange-600 !border-none"
                >
                    Làm mới
                </Button>
            </div>

            {/* Statistics Cards */}
            <Row gutter={16}>
                <Col xs={12} sm={6}>
                    <Card className="!border-none !shadow-sm">
                        <Statistic
                            title="Tổng đơn"
                            value={stats.total}
                            prefix={<FileText className="w-5 h-5 text-blue-500" />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card className="!border-none !shadow-sm">
                        <Statistic
                            title="Chờ duyệt"
                            value={stats.pending}
                            valueStyle={{ color: '#f97316' }}
                            prefix={<Clock className="w-5 h-5 text-orange-500" />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card className="!border-none !shadow-sm">
                        <Statistic
                            title="Đã duyệt"
                            value={stats.approved}
                            valueStyle={{ color: '#22c55e' }}
                            prefix={<CheckCircle className="w-5 h-5 text-green-500" />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card className="!border-none !shadow-sm">
                        <Statistic
                            title="Từ chối"
                            value={stats.rejected}
                            valueStyle={{ color: '#ef4444' }}
                            prefix={<XCircle className="w-5 h-5 text-red-500" />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <Input
                    placeholder="Tìm kiếm theo tên phòng, người đặt..."
                    prefix={<Search className="w-4 h-4 text-gray-400" />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="!max-w-md"
                    allowClear
                />
                <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    className="!w-40"
                    options={[
                        { value: 'all', label: 'Tất cả' },
                        { value: 'pending', label: 'Chờ duyệt' },
                        { value: 'approved', label: 'Đã duyệt' },
                        { value: 'rejected', label: 'Từ chối' },
                    ]}
                    prefix={<Filter className="w-4 h-4" />}
                />
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={filteredBookings}
                rowKey="_id"
                loading={loading}
                scroll={{ x: 1200 }}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn đặt phòng`,
                }}
            />

            {/* Detail Drawer */}
            <Drawer
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="font-bold">Chi tiết đơn đặt phòng</h3>
                            <p className="text-sm text-gray-500 font-normal">
                                #{selectedBooking?._id?.slice(-6).toUpperCase()}
                            </p>
                        </div>
                    </div>
                }
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                width={600}
                footer={
                    selectedBooking?.approveStatus === 'pending' && (
                        <div className="flex gap-3">
                            <Popconfirm
                                title="Từ chối đơn đặt phòng?"
                                onConfirm={() => handleReject(selectedBooking._id)}
                                okText="Từ chối"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button size="large" danger icon={<XCircle className="w-4 h-4" />} className="flex-1">
                                    Từ chối
                                </Button>
                            </Popconfirm>
                            <Popconfirm
                                title="Duyệt đơn đặt phòng?"
                                onConfirm={() => handleApprove(selectedBooking._id)}
                                okText="Duyệt"
                                cancelText="Hủy"
                            >
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<CheckCircle className="w-4 h-4" />}
                                    className="flex-1 !bg-green-500 hover:!bg-green-600 !border-none"
                                >
                                    Duyệt đơn
                                </Button>
                            </Popconfirm>
                        </div>
                    )
                }
            >
                {selectedBooking && (
                    <div className="space-y-6">
                        {/* Status Tags */}
                        <div className="flex flex-wrap gap-2">
                            {getApproveStatusTag(selectedBooking.approveStatus)}
                            {getPaymentStatusTag(selectedBooking.paymentStatus)}
                            {getBookingStatusTag(selectedBooking.status)}
                        </div>

                        {/* Room Info */}
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Home className="w-4 h-4 text-orange-500" />
                                Thông tin phòng
                            </h4>
                            <div className="flex gap-4">
                                <img
                                    src={`${import.meta.env.VITE_API_URL}${selectedBooking.roomId?.images?.[0]}`}
                                    alt=""
                                    className="w-24 h-24 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{selectedBooking.roomId?.title}</p>
                                    <p className="text-orange-500 font-bold text-lg">
                                        {formatPrice(selectedBooking.roomId?.price)}đ/tháng
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3" />
                                        {selectedBooking.roomId?.address}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="p-4 bg-blue-50 rounded-xl">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-500" />
                                Thông tin người đặt
                            </h4>
                            <div className="flex items-center gap-3">
                                <Avatar size={48} className="!bg-blue-500">
                                    {selectedBooking.userId?.fullName?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                <div>
                                    <p className="font-medium text-gray-800">{selectedBooking.userId?.fullName}</p>
                                    <p className="text-sm text-gray-500">{selectedBooking.userId?.email}</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {selectedBooking.userId?.phone}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Booking Details */}
                        <Descriptions column={2} bordered size="small">
                            <Descriptions.Item label="Ngày bắt đầu" span={1}>
                                {formatDate(selectedBooking.startDate)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số tháng thuê" span={1}>
                                {selectedBooking.rentMonths} tháng
                            </Descriptions.Item>
                            <Descriptions.Item label="Tiền phòng/tháng" span={1}>
                                {formatPrice(selectedBooking.pricePerMonth || selectedBooking.roomId?.price)}đ
                            </Descriptions.Item>
                            <Descriptions.Item label="Tiền cọc" span={1}>
                                {formatPrice(selectedBooking.depositAmount || selectedBooking.roomId?.deposit)}đ
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng thanh toán ban đầu" span={2}>
                                <span className="text-orange-500 font-bold text-lg">
                                    {formatPrice(
                                        selectedBooking.initialPaymentAmount ||
                                            (selectedBooking.roomId?.price || 0) +
                                                (selectedBooking.roomId?.deposit || 0),
                                    )}
                                    đ
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo đơn" span={1}>
                                {dayjs(selectedBooking.createdAt).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật lần cuối" span={1}>
                                {dayjs(selectedBooking.updatedAt).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Payment Schedule */}
                        {selectedBooking.monthlySchedule?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-green-500" />
                                    Lịch thanh toán
                                </h4>
                                <Timeline
                                    items={selectedBooking.monthlySchedule.map((schedule) => ({
                                        color:
                                            schedule.status === 'paid'
                                                ? 'green'
                                                : schedule.status === 'late'
                                                ? 'red'
                                                : 'gray',
                                        children: (
                                            <div className="flex justify-between">
                                                <span>Tháng {schedule.month}</span>
                                                <span>
                                                    {formatPrice(schedule.amount)}đ - {formatDate(schedule.dueDate)}
                                                </span>
                                            </div>
                                        ),
                                    }))}
                                />
                            </div>
                        )}
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default BookingManagement;
