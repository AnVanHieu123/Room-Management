import { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Input,
    Space,
    Modal,
    Form,
    Popconfirm,
    message,
    Tooltip,
    Tag,
    Select,
    InputNumber,
    Upload,
    Image,
    Drawer,
    Descriptions,
    Rate,
    Row,
    Col,
    AutoComplete,
} from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Home,
    Eye,
    MapPin,
    Phone,
    User,
    Star,
    Upload as UploadIcon,
    X,
} from 'lucide-react';
import dayjs from 'dayjs';
import { createRoom, getAllRoom, updateRoom, deleteRoom } from '../../config/RoomRequest';
import { requestGetAllCategory } from '../../config/CategoryRequest';
import { useRef } from 'react';

import useDebounce from '../../hooks/useDebounce';

const { TextArea } = Input;
const { Option } = Select;

// Predefined utilities options
const utilitiesOptions = [
    'Điều hòa',
    'Nóng lạnh',
    'Tủ lạnh',
    'Máy giặt',
    'Giường',
    'Tủ quần áo',
    'Bàn làm việc',
    'WiFi',
    'TV',
    'Bếp',
];

const buildingAmenitiesOptions = [
    'Bảo vệ 24/7',
    'Thang máy',
    'Bãi đỗ xe',
    'Camera an ninh',
    'Khu vực giặt chung',
    'Sân thượng',
    'Phòng gym',
    'Hồ bơi',
];

const RoomManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [form] = Form.useForm();
    const [imageList, setImageList] = useState([]);
    const [fileList, setFileList] = useState([]); // For Upload component
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [valueSearch, setValueSearch] = useState('');
    const [dataSearch, setDataSearch] = useState([]);
    const [mapQuery, setMapQuery] = useState('Lăng Chủ tịch Hồ Chí Minh');

    // Room data
    const [rooms, setRooms] = useState([]);

    // Fetch categories
    useEffect(() => {
        const fetchCategory = async () => {
            const res = await requestGetAllCategory();
            setCategories(res.metadata);
        };
        const fetchRoom = async () => {
            const res = await getAllRoom();
            setRooms(res.metadata);
        };
        fetchCategory();
        fetchRoom();
    }, []);

    const debounceAddress = useDebounce(valueSearch, 800);

    useEffect(() => {
        const fetchAddress = async () => {
            if (!debounceAddress || debounceAddress.trim() === '') {
                setDataSearch([]);
                return;
            }
            try {
                const res = await axios.get(`https://rsapi.goong.io/Place/AutoComplete`, {
                    params: {
                        input: debounceAddress,
                        api_key: import.meta.env.VITE_GOONG_API_KEY,
                    },
                });
                setDataSearch(res.data.predictions || []);
            } catch (error) {
                console.error('Error fetching address:', error);
                setDataSearch([]);
            }
        };
        fetchAddress();
    }, [debounceAddress]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleLocationSearch = (searchText) => {
        setValueSearch(searchText);
    };

    const handleLocationSelect = (selectedValue) => {
        form.setFieldsValue({ address: selectedValue });
        setMapQuery(selectedValue);
    };

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'images',
            key: 'images',
            width: 100,
            render: (images) => (
                <Image
                    src={`${import.meta.env.VITE_API_URL}/${images?.[0] || 'https://via.placeholder.com/80x60'}`}
                    alt="room"
                    width={80}
                    height={60}
                    className="rounded-lg object-cover"
                    fallback="https://via.placeholder.com/80x60"
                />
            ),
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div>
                    <p className="font-semibold text-gray-800 line-clamp-1">{text}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        {record.address}
                    </p>
                </div>
            ),
        },
        {
            title: 'Danh mục',
            dataIndex: 'categoryId',
            key: 'categoryId',
            render: (category) => (
                <Tag color="blue" className="rounded-lg">
                    {category?.nameCategory || 'N/A'}
                </Tag>
            ),
        },
        {
            title: 'Giá thuê',
            dataIndex: 'price',
            key: 'price',
            sorter: (a, b) => a.price - b.price,
            render: (price) => <span className="text-orange-600 font-semibold">{formatPrice(price)}/tháng</span>,
        },
        {
            title: 'Diện tích',
            dataIndex: 'area',
            key: 'area',
            sorter: (a, b) => a.area - b.area,
            render: (area) => <span>{area} m²</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Còn phòng', value: 'available' },
                { text: 'Hết phòng', value: 'occupied' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Tag color={status === 'available' ? 'green' : 'red'} className="rounded-lg">
                    {status === 'available' ? 'Còn phòng' : 'Hết phòng'}
                </Tag>
            ),
        },
        {
            title: 'Đánh giá',
            dataIndex: 'averageRating',
            key: 'averageRating',
            render: (rating) => (
                <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span>{rating?.toFixed(1) || '0.0'}</span>
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<Eye size={18} className="text-green-500" />}
                            onClick={() => handleView(record)}
                            className="hover:bg-green-50"
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<Edit size={18} className="text-blue-500" />}
                            onClick={() => handleEdit(record)}
                            className="hover:bg-blue-50"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa phòng trọ"
                        description="Bạn có chắc chắn muốn xóa phòng này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button
                                type="text"
                                icon={<Trash2 size={18} className="text-red-500" />}
                                className="hover:bg-red-50"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleView = (record) => {
        setSelectedRoom(record);
        setIsDrawerOpen(true);
    };

    const handleEdit = (record) => {
        setEditingRoom(record);
        form.setFieldsValue({
            ...record,
            categoryId: record.categoryId?._id,
        });
        // Convert existing images to fileList format for display
        const existingImages = (record.images || []).map((img, index) => ({
            uid: `-${index}`,
            name: `image-${index}`,
            status: 'done',
            url: `${import.meta.env.VITE_API_URL}/${img}`,
            originUrl: img, // Keep original path for sending to server
        }));
        setFileList(existingImages);
        setImageList(record.images || []);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteRoom(id);
            setRooms(rooms.filter((room) => room._id !== id));
            message.success('Đã xóa phòng thành công');
        } catch (error) {
            message.error('Xóa phòng thất bại!');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Create FormData
            const formData = new FormData();

            // Append simple fields
            formData.append('title', values.title);
            formData.append('description', values.description || '');
            formData.append('price', values.price);
            formData.append('area', values.area);
            formData.append('categoryId', values.categoryId);
            formData.append('address', values.address);
            formData.append('status', values.status || 'available');
            formData.append('deposit', values.deposit || 0);
            formData.append('minContractMonths', values.minContractMonths || 6);
            formData.append('ownerName', values.ownerName);
            formData.append('ownerPhone', values.ownerPhone);

            // Append arrays as JSON strings
            if (values.utilities) {
                formData.append('utilities', JSON.stringify(values.utilities));
            }
            if (values.buildingAmenities) {
                formData.append('buildingAmenities', JSON.stringify(values.buildingAmenities));
            }

            // Append pricesDetail as JSON string
            const pricesDetail = {
                electricity: values.pricesDetail?.electricity || 3800,
                water: values.pricesDetail?.water || 25000,
                internet: values.pricesDetail?.internet || 100000,
                parking: values.pricesDetail?.parking || 0,
            };
            formData.append('pricesDetail', JSON.stringify(pricesDetail));

            // Separate old images (existing) and new images (newly uploaded)
            const oldImages = []; // Images to keep
            const newFiles = []; // New files to upload

            fileList.forEach((file) => {
                if (file.originFileObj) {
                    // This is a new file
                    newFiles.push(file.originFileObj);
                } else if (file.originUrl) {
                    // This is an existing image that user wants to keep
                    oldImages.push(file.originUrl);
                }
            });

            // Append oldImages for editing
            if (editingRoom && oldImages.length > 0) {
                formData.append('oldImages', JSON.stringify(oldImages));
            }

            // Append new image files
            newFiles.forEach((file) => {
                formData.append('images', file);
            });

            if (editingRoom) {
                // Update room
                const res = await updateRoom(editingRoom._id, formData);
                if (res.metadata) {
                    message.success('Cập nhật phòng thành công');
                    // Update room in state
                    setRooms(rooms.map((room) => (room._id === editingRoom._id ? res.metadata : room)));
                }
            } else {
                // Create new room
                const res = await createRoom(formData);
                if (res.metadata) {
                    message.success('Thêm phòng thành công');
                    // Refresh room list or add to state
                    setRooms([res.metadata, ...rooms]);
                }
            }
            handleModalCancel();
        } catch (error) {
            console.error('Error:', error);
            message.error('Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setEditingRoom(null);
        setImageList([]);
        setFileList([]);
        form.resetFields();
    };

    // Handle image upload
    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const uploadButton = (
        <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 cursor-pointer">
            <UploadIcon size={24} className="text-gray-400" />
            <span className="mt-2 text-gray-500">Tải ảnh lên</span>
        </div>
    );

    const filteredRooms = rooms.filter((room) => {
        const matchSearch =
            room.title?.toLowerCase().includes(searchText.toLowerCase()) ||
            room.address?.toLowerCase().includes(searchText.toLowerCase());
        const matchStatus = statusFilter === 'all' || room.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Home className="text-orange-500" size={28} />
                        Quản lý phòng trọ
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý các phòng trọ trên hệ thống</p>
                </div>

                <Button
                    type="primary"
                    icon={<Plus size={18} />}
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 border-0 h-11 px-6 rounded-xl shadow-lg shadow-orange-200"
                >
                    Thêm phòng mới
                </Button>
            </div>

            {/* Search and Filter */}
            <Card className="rounded-2xl shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <Input
                        placeholder="Tìm kiếm theo tiêu đề, địa chỉ..."
                        prefix={<Search size={18} className="text-gray-400" />}
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setValueSearch(e.target.value);
                        }}
                        className="max-w-md h-11 rounded-xl"
                        allowClear
                    />

                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        className="w-40 h-11"
                        options={[
                            { value: 'all', label: 'Tất cả' },
                            { value: 'available', label: 'Còn phòng' },
                            { value: 'occupied', label: 'Hết phòng' },
                        ]}
                    />
                    <div className="flex items-center gap-2 text-gray-500 text-sm ml-auto">
                        <span>Tổng cộng:</span>
                        <Tag color="orange" className="rounded-lg">
                            {filteredRooms.length} phòng
                        </Tag>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card className="rounded-2xl shadow-sm">
                <Table
                    dataSource={filteredRooms}
                    columns={columns}
                    rowKey="_id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phòng`,
                    }}
                    className="admin-table"
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={
                    <span className="text-lg font-semibold">{editingRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}</span>
                }
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                confirmLoading={loading}
                okText={editingRoom ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                okButtonProps={{
                    className: 'bg-orange-500 hover:bg-orange-600 border-0 h-10 px-6 rounded-lg',
                }}
                cancelButtonProps={{
                    className: 'h-10 px-6 rounded-lg',
                }}
                width={800}
                className="rounded-2xl"
            >
                <Form form={form} layout="vertical" className="mt-6">
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="title"
                                label={<span className="font-medium">Tiêu đề</span>}
                                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                            >
                                <Input placeholder="VD: Phòng trọ cao cấp Quận 1" className="h-11 rounded-lg" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="categoryId"
                                label={<span className="font-medium">Danh mục</span>}
                                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                            >
                                <Select placeholder="Chọn danh mục" className="h-11">
                                    {categories.map((cat) => (
                                        <Option key={cat._id} value={cat._id}>
                                            {cat.nameCategory}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label={<span className="font-medium">Trạng thái</span>}
                                initialValue="available"
                            >
                                <Select className="h-11">
                                    <Option value="available">Còn phòng</Option>
                                    <Option value="occupied">Hết phòng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="price"
                                label={<span className="font-medium">Giá thuê (VNĐ/tháng)</span>}
                                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                            >
                                <InputNumber
                                    className="w-full h-11 rounded-lg"
                                    style={{ width: '100%' }}
                                    placeholder="5000000"
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="area"
                                label={<span className="font-medium">Diện tích (m²)</span>}
                                rules={[{ required: true, message: 'Vui lòng nhập diện tích' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    className="w-full h-11 rounded-lg"
                                    placeholder="25"
                                    min={1}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="deposit" label={<span className="font-medium">Tiền cọc (VNĐ)</span>}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    className="w-full h-11 rounded-lg"
                                    placeholder="5000000"
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[{ required: true, message: 'Vui lòng nhập hoặc chọn địa chỉ' }]}
                    >
                        <AutoComplete
                            options={dataSearch?.map((item) => ({ value: item.description }))}
                            onSearch={handleLocationSearch}
                            onSelect={handleLocationSelect}
                            onChange={(value) => {
                                form.setFieldsValue({ address: value });
                                setMapQuery(value || 'Lăng Chủ tịch Hồ Chí Minh');
                            }}
                            placeholder="Nhập địa chỉ hoặc chọn từ gợi ý..."
                        >
                            <Input />
                        </AutoComplete>
                    </Form.Item>

                    {mapQuery && (
                        <iframe
                            className="mb-4"
                            src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                            width="100%"
                            height="250"
                            style={{ border: 0, borderRadius: '8px' }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Property Location"
                        />
                    )}

                    <Form.Item
                        name="description"
                        label={<span className="font-medium">Mô tả</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                        className="mb-10"
                    >
                        <ReactQuill theme="snow" style={{ height: 250 }} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="ownerName"
                                label={<span className="font-medium">Tên chủ nhà</span>}
                                rules={[{ required: true, message: 'Vui lòng nhập tên chủ nhà' }]}
                            >
                                <Input placeholder="Nguyễn Văn A" className="h-11 rounded-lg" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="ownerPhone"
                                label={<span className="font-medium">SĐT chủ nhà</span>}
                                rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
                            >
                                <Input placeholder="0901234567" className="h-11 rounded-lg" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="utilities" label={<span className="font-medium">Tiện ích phòng</span>}>
                        <Select mode="multiple" placeholder="Chọn tiện ích" className="rounded-lg">
                            {utilitiesOptions.map((util) => (
                                <Option key={util} value={util}>
                                    {util}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="buildingAmenities" label={<span className="font-medium">Tiện ích tòa nhà</span>}>
                        <Select mode="multiple" placeholder="Chọn tiện ích tòa nhà" className="rounded-lg">
                            {buildingAmenitiesOptions.map((amenity) => (
                                <Option key={amenity} value={amenity}>
                                    {amenity}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item
                                name={['pricesDetail', 'electricity']}
                                label={<span className="font-medium">Tiền điện/kWh</span>}
                                initialValue={3800}
                            >
                                <InputNumber style={{ width: '100%' }} className="w-full rounded-lg" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name={['pricesDetail', 'water']}
                                label={<span className="font-medium">Tiền nước/m³</span>}
                                initialValue={25000}
                            >
                                <InputNumber style={{ width: '100%' }} className="w-full rounded-lg" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name={['pricesDetail', 'internet']}
                                label={<span className="font-medium">Internet</span>}
                                initialValue={100000}
                            >
                                <InputNumber style={{ width: '100%' }} className="w-full rounded-lg" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name={['pricesDetail', 'parking']}
                                label={<span className="font-medium">Gửi xe</span>}
                                initialValue={0}
                            >
                                <InputNumber className="w-full rounded-lg" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="minContractMonths"
                        label={<span className="font-medium">Hợp đồng tối thiểu (tháng)</span>}
                        initialValue={6}
                    >
                        <InputNumber style={{ width: '100%' }} className="w-full h-11 rounded-lg" min={1} />
                    </Form.Item>

                    {/* Image Upload */}
                    <Form.Item label={<span className="font-medium">Hình ảnh phòng</span>}>
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={handleUploadChange}
                            beforeUpload={() => false} // Prevent auto upload
                            multiple
                            accept="image/*"
                        >
                            {fileList.length >= 8 ? null : uploadButton}
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Detail Drawer */}
            <Drawer
                title={
                    <span className="text-lg font-semibold flex items-center gap-2">
                        <Home className="text-orange-500" size={20} />
                        Chi tiết phòng
                    </span>
                }
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                width={600}
            >
                {selectedRoom && (
                    <div className="space-y-6">
                        {/* Images */}
                        <div>
                            <Image.PreviewGroup>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedRoom.images?.map((img, idx) => (
                                        <Image
                                            key={idx}
                                            src={`${import.meta.env.VITE_API_URL}/${img}`}
                                            alt={`room-${idx}`}
                                            className="rounded-lg object-cover"
                                            height={150}
                                        />
                                    ))}
                                </div>
                            </Image.PreviewGroup>
                        </div>

                        {/* Title & Status */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{selectedRoom.title}</h2>
                                <p className="text-gray-500 flex items-center gap-1 mt-1">
                                    <MapPin size={14} />
                                    {selectedRoom.address}
                                </p>
                            </div>
                            <Tag
                                color={selectedRoom.status === 'available' ? 'green' : 'red'}
                                className="rounded-lg px-3 py-1"
                            >
                                {selectedRoom.status === 'available' ? 'Còn phòng' : 'Hết phòng'}
                            </Tag>
                        </div>

                        {/* Price & Area */}
                        <div className="bg-orange-50 rounded-xl p-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-gray-500 text-sm">Giá thuê</p>
                                    <p className="text-xl font-bold text-orange-600">
                                        {formatPrice(selectedRoom.price)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Diện tích</p>
                                    <p className="text-xl font-bold text-gray-800">{selectedRoom.area} m²</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Đánh giá</p>
                                    <div className="flex items-center justify-center gap-1">
                                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                        <span className="text-xl font-bold">
                                            {selectedRoom.averageRating?.toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Mô tả</h3>
                            <p
                                className="text-gray-600"
                                dangerouslySetInnerHTML={{ __html: selectedRoom.description }}
                            />
                        </div>

                        {/* Utilities */}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Tiện ích phòng</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedRoom.utilities?.map((util) => (
                                    <Tag key={util} color="blue" className="rounded-lg">
                                        {util}
                                    </Tag>
                                ))}
                            </div>
                        </div>

                        {/* Building Amenities */}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Tiện ích tòa nhà</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedRoom.buildingAmenities?.map((amenity) => (
                                    <Tag key={amenity} color="green" className="rounded-lg">
                                        {amenity}
                                    </Tag>
                                ))}
                            </div>
                        </div>

                        {/* Price Details */}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Chi phí khác</h3>
                            <Descriptions column={2} size="small">
                                <Descriptions.Item label="Tiền điện">
                                    {formatPrice(selectedRoom.pricesDetail?.electricity || 0)}/kWh
                                </Descriptions.Item>
                                <Descriptions.Item label="Tiền nước">
                                    {formatPrice(selectedRoom.pricesDetail?.water || 0)}/m³
                                </Descriptions.Item>
                                <Descriptions.Item label="Internet">
                                    {formatPrice(selectedRoom.pricesDetail?.internet || 0)}/tháng
                                </Descriptions.Item>
                                <Descriptions.Item label="Gửi xe">
                                    {formatPrice(selectedRoom.pricesDetail?.parking || 0)}/tháng
                                </Descriptions.Item>
                                <Descriptions.Item label="Tiền cọc">
                                    {formatPrice(selectedRoom.deposit || 0)}
                                </Descriptions.Item>
                                <Descriptions.Item label="HĐ tối thiểu">
                                    {selectedRoom.minContractMonths} tháng
                                </Descriptions.Item>
                            </Descriptions>
                        </div>

                        {/* Owner Info */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-800 mb-3">Thông tin liên hệ</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <User className="text-orange-500" size={24} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{selectedRoom.ownerName}</p>
                                    <p className="text-gray-500 flex items-center gap-1">
                                        <Phone size={14} />
                                        {selectedRoom.ownerPhone}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>

            {/* Custom Table Styles */}
            <style>{`
                .admin-table .ant-table-thead > tr > th {
                    background-color: #fff7ed !important;
                    color: #c2410c !important;
                    font-weight: 600 !important;
                    border-bottom: 2px solid #fed7aa !important;
                }
                
                .admin-table .ant-table-tbody > tr:hover > td {
                    background-color: #fff7ed !important;
                }
                
                .admin-table .ant-table-tbody > tr > td {
                    padding: 12px 16px !important;
                }
            `}</style>
        </div>
    );
};

export default RoomManagement;
