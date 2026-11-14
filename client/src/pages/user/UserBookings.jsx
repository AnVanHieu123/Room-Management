import { useEffect, useState } from 'react';
import {
    Table,
    Tag,
    Button,
    Empty,
    Avatar,
    Drawer,
    Descriptions,
    Modal,
    message,
    Radio,
    Rate,
    Input,
    Upload,
} from 'antd';
import {
    Calendar,
    MapPin,
    Eye,
    Clock,
    CreditCard,
    Home,
    CheckCircle,
    XCircle,
    AlertCircle,
    Wallet,
    ShieldCheck,
    Star,
    MessageSquare,
    ImagePlus,
    X,
} from 'lucide-react';
import dayjs from 'dayjs';
import { CreatePayment, CreatePaymentMonth, getMyBookings } from '../../config/BookingRequest';
import { requestCreatePreviewProduct } from '../../config/PreviewProduct';

const UserBookings = () => {
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [bookings, setBookings] = useState([]);

    // Initial Payment modal states
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('momo');
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Monthly Payment modal states
    const [monthlyPaymentModalOpen, setMonthlyPaymentModalOpen] = useState(false);
    const [selectedMonthlyPaymentMethod, setSelectedMonthlyPaymentMethod] = useState('momo');
    const [monthlyPaymentLoading, setMonthlyPaymentLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [idPaymentMonth, setIdPaymentMonth] = useState(null);

    // Review modal states
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewImages, setReviewImages] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewBooking, setReviewBooking] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await getMyBookings();
            setBookings(res.metadata || []);
        };
        fetchData();
    }, []);

    const formatPrice = (price) => {
        return price?.toLocaleString('vi-VN') || '0';
    };

    const formatDate = (date) => {
        return date ? dayjs(date).format('DD/MM/YYYY') : '-';
    };

    const getApproveStatusTag = (status) => {
        const config = {
            pending: { color: 'orange', text: 'Chờ duyệt', icon: <AlertCircle size={14} /> },
            approved: { color: 'green', text: 'Đã duyệt', icon: <CheckCircle size={14} /> },
            rejected: { color: 'red', text: 'Từ chối', icon: <XCircle size={14} /> },
        };
        return (
            <Tag color={config[status]?.color} className="!flex !items-center !gap-1 !px-3 !py-1">
                {config[status]?.icon}
                {config[status]?.text}
            </Tag>
        );
    };

    const getPaymentStatusTag = (status) => {
        const config = {
            waiting_payment: { color: 'default', text: 'Chờ thanh toán' },
            paid: { color: 'blue', text: 'Đã thanh toán' },
        };
        return <Tag color={config[status]?.color}>{config[status]?.text}</Tag>;
    };

    const handleOpenPaymentModal = () => {
        setSelectedPaymentMethod('momo');
        setPaymentModalOpen(true);
    };

    const handleOpenMonthlyPaymentModal = (month) => {
        setIdPaymentMonth(month._id);
        setSelectedMonth(month.month);
        setSelectedMonthlyPaymentMethod('momo');
        setMonthlyPaymentModalOpen(true);
    };

    const handlePayment = async () => {
        if (!selectedPaymentMethod) {
            message.error('Vui lòng chọn phương thức thanh toán!');
            return;
        }

        setPaymentLoading(true);

        const data = {
            paymentMethod: selectedPaymentMethod,
            bookingId: selectedBooking._id,
        };

        try {
            if (selectedPaymentMethod === 'momo') {
                const res = await CreatePayment(data);
                window.open(res.metadata.payUrl, '_blank');
            } else if (selectedPaymentMethod === 'vnpay') {
                const res = await CreatePayment(data);
                window.open(res.metadata, '_blank');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        } finally {
            setPaymentLoading(false);
        }
    };

    // Handle monthly payment
    const handleMonthlyPayment = async () => {
        const data = {
            paymentMethod: selectedMonthlyPaymentMethod,
            monthId: idPaymentMonth,
            bookingId: selectedBooking._id,
        };

        if (!selectedMonthlyPaymentMethod) {
            message.error('Vui lòng chọn phương thức thanh toán!');
            return;
        }

        setMonthlyPaymentLoading(true);

        try {
            if (selectedMonthlyPaymentMethod === 'momo') {
                const res = await CreatePaymentMonth(data);
                window.open(res.metadata.payUrl, '_blank');
            } else if (selectedMonthlyPaymentMethod === 'vnpay') {
                const res = await CreatePaymentMonth(data);
                window.open(res.metadata, '_blank');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        } finally {
            setMonthlyPaymentLoading(false);
        }
    };

    // Open review modal
    const handleOpenReviewModal = (booking) => {
        setReviewBooking(booking);
        setReviewRating(5);
        setReviewComment('');
        setReviewImages([]);
        setReviewModalOpen(true);
        console.log(booking);
    };

    // Close review modal
    const handleCloseReviewModal = () => {
        setReviewModalOpen(false);
        setReviewBooking(null);
        setReviewRating(5);
        setReviewComment('');
        setReviewImages([]);
    };

    // Handle image upload change
    const handleReviewImageChange = ({ fileList }) => {
        setReviewImages(fileList);
    };

    // Handle remove image
    const handleRemoveImage = (file) => {
        setReviewImages(reviewImages.filter((item) => item.uid !== file.uid));
    };

    // Submit review (UI only - placeholder)
    const handleSubmitReview = async () => {
        if (!reviewComment.trim()) {
            message.error('Vui lòng nhập nội dung đánh giá!');
            return;
        }
        if (reviewRating === 0) {
            message.error('Vui lòng chọn số sao đánh giá!');
            return;
        }

        setReviewLoading(true);

        try {
            const formData = new FormData();
            formData.append('roomId', reviewBooking.roomId._id);
            reviewImages.forEach((image) => {
                formData.append('images', image.originFileObj);
            });
            formData.append('rating', reviewRating);
            formData.append('comment', reviewComment);
            await requestCreatePreviewProduct(formData);
        } catch (error) {}

        // Simulating API call - UI only
        // setTimeout(() => {
        //     message.success('Cảm ơn bạn đã đánh giá!');
        //     setReviewLoading(false);
        //     handleCloseReviewModal();
        // }, 1000);
    };

    const columns = [
        {
            title: 'Phòng',
            dataIndex: 'roomId',
            key: 'room',
            render: (room) => (
                <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden">
                        <img
                            src={
                                room?.images?.[0]
                                    ? `${import.meta.env.VITE_API_URL}${room.images[0]}`
                                    : '/placeholder.jpg'
                            }
                            alt={room?.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800 line-clamp-1">{room?.title}</p>
                        <p className="text-sm text-orange-500 font-semibold">{formatPrice(room?.price)}đ/tháng</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => (
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>{formatDate(date)}</span>
                </div>
            ),
        },
        {
            title: 'Thời gian thuê',
            dataIndex: 'rentMonths',
            key: 'rentMonths',
            render: (months) => (
                <Tag color="blue" className="!rounded-full">
                    {months} tháng
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'approveStatus',
            key: 'approveStatus',
            render: (status) => getApproveStatusTag(status),
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status) => getPaymentStatusTag(status),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Button
                        type="text"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => {
                            setSelectedBooking(record);
                            setDrawerOpen(true);
                        }}
                        className="!text-orange-500 hover:!bg-orange-50"
                    >
                        Chi tiết
                    </Button>
                    {record.approveStatus === 'approved' && (
                        <Button
                            type="text"
                            icon={<Star className="w-4 h-4" />}
                            onClick={() => handleOpenReviewModal(record)}
                            className="!text-yellow-500 hover:!bg-yellow-50"
                        >
                            Đánh giá
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const paymentMethods = [
        {
            id: 'vnpay',
            name: 'VNPay',
            description: 'Thanh toán qua VNPay',
            logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR.png',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-500',
        },
        {
            id: 'momo',
            name: 'MoMo',
            description: 'Thanh toán qua ví MoMo',
            logo: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png',
            color: 'from-pink-500 to-pink-600',
            bgColor: 'bg-pink-50',
            borderColor: 'border-pink-500',
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Phòng trọ đã thuê</h1>
                <p className="text-gray-500">Quản lý các đơn đặt phòng của bạn</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Home className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-600">Tổng đơn</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <span className="text-gray-600">Chờ duyệt</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-500">
                        {bookings.filter((b) => b.approveStatus === 'pending').length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200/50">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-600">Đang thuê</span>
                    </div>
                    <p className="text-2xl font-bold text-green-500">
                        {bookings.filter((b) => b.status === 'active').length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-5 h-5 text-purple-500" />
                        <span className="text-gray-600">Đã hoàn tất</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-500">
                        {bookings.filter((b) => b.paymentStatus === 'full').length}
                    </p>
                </div>
            </div>

            {/* Table */}
            {bookings.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={bookings}
                    rowKey="_id"
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng ${total} đơn đặt phòng`,
                    }}
                />
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span className="text-gray-500">Bạn chưa có đơn đặt phòng nào</span>}
                >
                    <Button
                        type="primary"
                        className="!bg-orange-500 hover:!bg-orange-600 !border-none"
                        onClick={() => (window.location.href = '/')}
                    >
                        Tìm phòng ngay
                    </Button>
                </Empty>
            )}

            {/* Detail Drawer */}
            <Drawer
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Home className="w-5 h-5 text-orange-500" />
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
                width={500}
            >
                {selectedBooking && (
                    <div className="space-y-6">
                        {/* Status */}
                        <div className="flex flex-wrap gap-2">
                            {getApproveStatusTag(selectedBooking.approveStatus)}
                            {getPaymentStatusTag(selectedBooking.paymentStatus)}
                        </div>

                        {/* Room Info */}
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex gap-4">
                                <img
                                    src={
                                        selectedBooking.roomId?.images?.[0]
                                            ? `${import.meta.env.VITE_API_URL}${selectedBooking.roomId.images[0]}`
                                            : '/placeholder.jpg'
                                    }
                                    alt=""
                                    className="w-20 h-20 rounded-lg object-cover"
                                />
                                <div>
                                    <p className="font-medium text-gray-800">{selectedBooking.roomId?.title}</p>
                                    <p className="text-orange-500 font-bold">
                                        {formatPrice(selectedBooking.roomId?.price)}đ/tháng
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3" />
                                        {selectedBooking.roomId?.address}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Booking Details */}
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Ngày bắt đầu thuê">
                                {formatDate(selectedBooking.startDate)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian thuê">
                                {selectedBooking.rentMonths} tháng
                            </Descriptions.Item>
                            <Descriptions.Item label="Tiền phòng/tháng">
                                {formatPrice(selectedBooking.pricePerMonth)}đ
                            </Descriptions.Item>
                            <Descriptions.Item label="Tiền cọc">
                                {formatPrice(selectedBooking.depositAmount)}đ
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng thanh toán ban đầu">
                                <span className="text-orange-500 font-bold text-lg">
                                    {formatPrice(selectedBooking.initialPaymentAmount)}đ
                                </span>
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Payment Button */}
                        {selectedBooking.approveStatus === 'approved' &&
                            selectedBooking.paymentStatus === 'waiting_payment' && (
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<CreditCard className="w-4 h-4" />}
                                    className="!w-full !h-12 !bg-orange-500 hover:!bg-orange-600 !border-none !rounded-xl"
                                    onClick={handleOpenPaymentModal}
                                >
                                    Thanh toán tiền cọc + tháng đầu
                                </Button>
                            )}

                        {/* Review Button */}
                        {selectedBooking.approveStatus === 'approved' && (
                            <Button
                                type="default"
                                size="large"
                                icon={<Star className="w-4 h-4" />}
                                className="!w-full !h-12 !border-2 !border-yellow-400 !text-yellow-600 hover:!bg-yellow-50 !rounded-xl !font-medium"
                                onClick={() => {
                                    setDrawerOpen(false);
                                    handleOpenReviewModal(selectedBooking);
                                }}
                            >
                                Viết đánh giá phòng trọ
                            </Button>
                        )}

                        {/* Monthly Payment Schedule */}
                        {selectedBooking.paymentStatus === 'paid' && selectedBooking.monthlySchedule?.length > 0 && (
                            <div className="mt-6">
                                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-orange-500" />
                                    Lịch thanh toán các tháng
                                </h4>
                                <div className="space-y-3">
                                    {selectedBooking.monthlySchedule.map((schedule, index) => {
                                        const isPending = schedule.status === 'pending';
                                        const isPaid = schedule.status === 'paid';
                                        const isLate = schedule.status === 'late';
                                        const isOverdue = isPending && new Date(schedule.dueDate) < new Date();

                                        return (
                                            <div
                                                key={index}
                                                className={`p-4 rounded-xl border-2 transition-all ${
                                                    isPaid
                                                        ? 'bg-green-50 border-green-200'
                                                        : isLate || isOverdue
                                                        ? 'bg-red-50 border-red-200'
                                                        : 'bg-gray-50 border-gray-200 hover:border-orange-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                                isPaid
                                                                    ? 'bg-green-100'
                                                                    : isLate || isOverdue
                                                                    ? 'bg-red-100'
                                                                    : 'bg-orange-100'
                                                            }`}
                                                        >
                                                            {isPaid ? (
                                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                                            ) : isLate || isOverdue ? (
                                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                                            ) : (
                                                                <Clock className="w-5 h-5 text-orange-500" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">
                                                                Tháng {schedule.month}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                Hạn: {formatDate(schedule.dueDate)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-800">
                                                            {formatPrice(selectedBooking.pricePerMonth)}đ
                                                        </p>
                                                        {isPaid ? (
                                                            <Tag color="green" className="!mt-1">
                                                                Đã thanh toán
                                                            </Tag>
                                                        ) : isLate ? (
                                                            <Tag color="red" className="!mt-1">
                                                                Quá hạn
                                                            </Tag>
                                                        ) : isOverdue ? (
                                                            <Tag color="red" className="!mt-1">
                                                                Cần thanh toán
                                                            </Tag>
                                                        ) : (
                                                            <Tag color="orange" className="!mt-1">
                                                                Chờ thanh toán
                                                            </Tag>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Pay button for pending months */}
                                                {isPending && (
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        icon={<CreditCard className="w-3 h-3" />}
                                                        className={`!mt-3 !w-full !rounded-lg ${
                                                            isOverdue
                                                                ? '!bg-red-500 hover:!bg-red-600'
                                                                : '!bg-orange-500 hover:!bg-orange-600'
                                                        } !border-none`}
                                                        onClick={() => handleOpenMonthlyPaymentModal(schedule)}
                                                    >
                                                        Thanh toán tháng {schedule.month}
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Drawer>

            {/* Initial Payment Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Thanh toán ban đầu</h3>
                            <p className="text-sm text-gray-500 font-normal">Tiền cọc + Tháng đầu</p>
                        </div>
                    </div>
                }
                open={paymentModalOpen}
                onCancel={() => setPaymentModalOpen(false)}
                footer={null}
                width={480}
                centered
            >
                <div className="mt-6 space-y-6">
                    {/* Payment Amount */}
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl border border-orange-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Số tiền thanh toán</p>
                                <p className="text-3xl font-bold text-orange-500">
                                    {formatPrice(selectedBooking?.initialPaymentAmount)}đ
                                </p>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                                <CreditCard className="w-7 h-7 text-orange-500" />
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-orange-200/50 text-sm text-gray-500">
                            <div className="flex justify-between">
                                <span>Tiền cọc:</span>
                                <span>{formatPrice(selectedBooking?.depositAmount)}đ</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span>Tiền phòng tháng đầu:</span>
                                <span>{formatPrice(selectedBooking?.pricePerMonth)}đ</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">Phương thức thanh toán</p>
                        <div className="space-y-3">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => setSelectedPaymentMethod(method.id)}
                                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                        selectedPaymentMethod === method.id
                                            ? `${method.borderColor} ${method.bgColor}`
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center p-2 shadow-sm">
                                            <img
                                                src={method.logo}
                                                alt={method.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{method.name}</p>
                                            <p className="text-sm text-gray-500">{method.description}</p>
                                        </div>
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                selectedPaymentMethod === method.id
                                                    ? method.borderColor
                                                    : 'border-gray-300'
                                            }`}
                                        >
                                            {selectedPaymentMethod === method.id && (
                                                <div
                                                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${method.color}`}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    {selectedPaymentMethod === method.id && (
                                        <div className="absolute top-2 right-2">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Note */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-500">
                            Giao dịch của bạn được bảo mật và mã hóa. Chúng tôi không lưu trữ thông tin thẻ của bạn.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="primary"
                        size="large"
                        loading={paymentLoading}
                        onClick={handlePayment}
                        className={`!w-full !h-14 !border-none !rounded-xl !font-semibold !text-base ${
                            selectedPaymentMethod === 'vnpay'
                                ? '!bg-blue-500 hover:!bg-blue-600'
                                : '!bg-pink-500 hover:!bg-pink-600'
                        }`}
                    >
                        {paymentLoading
                            ? 'Đang xử lý...'
                            : `Thanh toán với ${selectedPaymentMethod === 'vnpay' ? 'VNPay' : 'MoMo'}`}
                    </Button>

                    <p className="text-xs text-gray-400 text-center">
                        Bằng việc thanh toán, bạn đồng ý với điều khoản sử dụng dịch vụ
                    </p>
                </div>
            </Modal>

            {/* Monthly Payment Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Thanh toán tiền phòng</h3>
                            <p className="text-sm text-gray-500 font-normal">Tháng {selectedMonth}</p>
                        </div>
                    </div>
                }
                open={monthlyPaymentModalOpen}
                onCancel={() => {
                    setMonthlyPaymentModalOpen(false);
                    setSelectedMonth(null);
                }}
                footer={null}
                width={480}
                centered
            >
                <div className="mt-6 space-y-6">
                    {/* Payment Amount */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl border border-green-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Số tiền thanh toán</p>
                                <p className="text-3xl font-bold text-green-500">
                                    {formatPrice(selectedBooking?.pricePerMonth)}đ
                                </p>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                                <CreditCard className="w-7 h-7 text-green-500" />
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-green-200/50 text-sm text-gray-500">
                            <div className="flex justify-between">
                                <span>Tháng thanh toán:</span>
                                <span className="font-medium text-green-600">Tháng {selectedMonth}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span>Tiền phòng:</span>
                                <span>{formatPrice(selectedBooking?.pricePerMonth)}đ</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">Phương thức thanh toán</p>
                        <div className="space-y-3">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => setSelectedMonthlyPaymentMethod(method.id)}
                                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                        selectedMonthlyPaymentMethod === method.id
                                            ? `${method.borderColor} ${method.bgColor}`
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center p-2 shadow-sm">
                                            <img
                                                src={method.logo}
                                                alt={method.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{method.name}</p>
                                            <p className="text-sm text-gray-500">{method.description}</p>
                                        </div>
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                selectedMonthlyPaymentMethod === method.id
                                                    ? method.borderColor
                                                    : 'border-gray-300'
                                            }`}
                                        >
                                            {selectedMonthlyPaymentMethod === method.id && (
                                                <div
                                                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${method.color}`}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    {selectedMonthlyPaymentMethod === method.id && (
                                        <div className="absolute top-2 right-2">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Note */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-500">
                            Giao dịch của bạn được bảo mật và mã hóa. Chúng tôi không lưu trữ thông tin thẻ của bạn.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="primary"
                        size="large"
                        loading={monthlyPaymentLoading}
                        onClick={() => handleMonthlyPayment()}
                        className={`!w-full !h-14 !border-none !rounded-xl !font-semibold !text-base ${
                            selectedMonthlyPaymentMethod === 'vnpay'
                                ? '!bg-blue-500 hover:!bg-blue-600'
                                : '!bg-pink-500 hover:!bg-pink-600'
                        }`}
                    >
                        {monthlyPaymentLoading
                            ? 'Đang xử lý...'
                            : `Thanh toán với ${selectedMonthlyPaymentMethod === 'vnpay' ? 'VNPay' : 'MoMo'}`}
                    </Button>

                    <p className="text-xs text-gray-400 text-center">
                        Bằng việc thanh toán, bạn đồng ý với điều khoản sử dụng dịch vụ
                    </p>
                </div>
            </Modal>

            {/* Review Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                            <Star className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Đánh giá phòng trọ</h3>
                            <p className="text-sm text-gray-500 font-normal">
                                {reviewBooking?.roomId?.title || 'Phòng trọ'}
                            </p>
                        </div>
                    </div>
                }
                open={reviewModalOpen}
                onCancel={handleCloseReviewModal}
                footer={null}
                width={520}
                centered
            >
                <div className="mt-6 space-y-6">
                    {/* Room Info Preview */}
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200/50">
                        <div className="flex gap-4">
                            <img
                                src={
                                    reviewBooking?.roomId?.images?.[0]
                                        ? `${import.meta.env.VITE_API_URL}${reviewBooking.roomId.images[0]}`
                                        : '/placeholder.jpg'
                                }
                                alt=""
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                                <p className="font-medium text-gray-800 line-clamp-1">{reviewBooking?.roomId?.title}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    {reviewBooking?.roomId?.address}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Star Rating */}
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                            Bạn hài lòng như thế nào với phòng trọ này?
                        </p>
                        <div className="flex justify-center items-center gap-2 p-4 bg-gray-50 rounded-xl">
                            <Rate
                                value={reviewRating}
                                onChange={setReviewRating}
                                className="!text-4xl"
                                style={{ fontSize: '36px' }}
                                character={<Star className="w-10 h-10" />}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            {reviewRating === 1 && 'Rất không hài lòng 😞'}
                            {reviewRating === 2 && 'Không hài lòng 😕'}
                            {reviewRating === 3 && 'Bình thường 😐'}
                            {reviewRating === 4 && 'Hài lòng 😊'}
                            {reviewRating === 5 && 'Rất hài lòng 🤩'}
                        </p>
                    </div>

                    {/* Comment */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="w-4 h-4 text-orange-500" />
                            <p className="text-sm font-medium text-gray-700">Nhận xét của bạn</p>
                        </div>
                        <Input.TextArea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn về phòng trọ này..."
                            rows={4}
                            maxLength={500}
                            showCount
                            className="!rounded-xl !border-gray-200 focus:!border-orange-400"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <ImagePlus className="w-4 h-4 text-orange-500" />
                            <p className="text-sm font-medium text-gray-700">Thêm hình ảnh (tùy chọn)</p>
                        </div>
                        <Upload
                            listType="picture-card"
                            fileList={reviewImages}
                            onChange={handleReviewImageChange}
                            onRemove={handleRemoveImage}
                            beforeUpload={() => false}
                            maxCount={5}
                            accept="image/*"
                            className="review-upload"
                        >
                            {reviewImages.length < 5 && (
                                <div className="flex flex-col items-center justify-center p-2">
                                    <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-500">Tải ảnh</span>
                                </div>
                            )}
                        </Upload>
                        <p className="text-xs text-gray-400 mt-2">Tối đa 5 ảnh, mỗi ảnh không quá 5MB</p>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="primary"
                        size="large"
                        loading={reviewLoading}
                        onClick={handleSubmitReview}
                        className="!w-full !h-14 !bg-gradient-to-r !from-yellow-400 !to-orange-500 hover:!from-yellow-500 hover:!to-orange-600 !border-none !rounded-xl !font-semibold !text-base !shadow-lg !shadow-orange-200"
                    >
                        {reviewLoading ? 'Đang gửi đánh giá...' : 'Gửi đánh giá'}
                    </Button>

                    <p className="text-xs text-gray-400 text-center">
                        Đánh giá của bạn sẽ giúp những người thuê khác có thêm thông tin
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default UserBookings;
