import { useState } from 'react';
import { Card, Table, Button, Input, Space, Modal, Form, Popconfirm, message, Tooltip, Tag } from 'antd';
import { Plus, Search, Edit, Trash2, FolderTree } from 'lucide-react';
import dayjs from 'dayjs';
import {
    requestCreateCategory,
    requestDeleteCategory,
    requestGetAllCategory,
    requestUpdateCategory,
} from '../../config/CategoryRequest';
import { useEffect } from 'react';

const CategoryManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    // Mock data based on category.model.js schema
    const [categories, setCategories] = useState([]);

    const fetchData = async () => {
        const res = await requestGetAllCategory();
        setCategories(res.metadata);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 70,
            render: (_, __, index) => (
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-semibold">
                    {index + 1}
                </div>
            ),
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'nameCategory',
            key: 'nameCategory',
            render: (text) => <span className="font-semibold text-gray-800">{text}</span>,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (date) => <span className="text-gray-500">{dayjs(date).format('DD/MM/YYYY HH:mm')}</span>,
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
            render: (date) => <span className="text-gray-500">{dayjs(date).format('DD/MM/YYYY HH:mm')}</span>,
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<Edit size={18} className="text-blue-500" />}
                            onClick={() => handleEdit(record)}
                            className="hover:bg-blue-50"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa danh mục"
                        description="Bạn có chắc chắn muốn xóa danh mục này?"
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

    const handleEdit = (record) => {
        setEditingCategory(record);
        form.setFieldsValue({ nameCategory: record.nameCategory });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        await requestDeleteCategory(id);
        fetchData();
        message.success('Đã xóa danh mục thành công');
    };

    const handleModalOk = () => {
        form.validateFields().then(async (values) => {
            const now = new Date().toISOString();
            if (editingCategory) {
                // Update existing category
                await requestUpdateCategory(editingCategory._id, values);
                fetchData();
                message.success('Cập nhật danh mục thành công');
            } else {
                // Add new category
                const newCategory = {
                    _id: String(categories.length + 1),
                    nameCategory: values.nameCategory,
                    createdAt: now,
                    updatedAt: now,
                };
                await requestCreateCategory(values);
                fetchData();
                message.success('Thêm danh mục thành công');
            }
            setIsModalOpen(false);
            setEditingCategory(null);
            form.resetFields();
        });
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        form.resetFields();
    };

    const filteredCategories = categories.filter((cat) =>
        cat.nameCategory.toLowerCase().includes(searchText.toLowerCase()),
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FolderTree className="text-orange-500" size={28} />
                        Quản lý danh mục
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý các danh mục phòng trọ trên hệ thống</p>
                </div>

                <Button
                    type="primary"
                    icon={<Plus size={18} />}
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 border-0 h-11 px-6 rounded-xl shadow-lg shadow-orange-200"
                >
                    Thêm danh mục
                </Button>
            </div>

            {/* Search and Filter */}
            <Card className="rounded-2xl shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <Input
                        placeholder="Tìm kiếm danh mục..."
                        prefix={<Search size={18} className="text-gray-400" />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="max-w-md h-11 rounded-xl"
                        allowClear
                    />
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span>Tổng cộng:</span>
                        <Tag color="orange" className="rounded-lg">
                            {filteredCategories.length} danh mục
                        </Tag>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card className="rounded-2xl shadow-sm">
                <Table
                    dataSource={filteredCategories}
                    columns={columns}
                    rowKey="_id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} danh mục`,
                    }}
                    className="admin-table"
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={
                    <span className="text-lg font-semibold">
                        {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                    </span>
                }
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText={editingCategory ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                okButtonProps={{
                    className: 'bg-orange-500 hover:bg-orange-600 border-0 h-10 px-6 rounded-lg',
                }}
                cancelButtonProps={{
                    className: 'h-10 px-6 rounded-lg',
                }}
                width={520}
                className="rounded-2xl"
            >
                <Form form={form} layout="vertical" className="mt-6">
                    <Form.Item
                        name="nameCategory"
                        label={<span className="font-medium">Tên danh mục</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                    >
                        <Input placeholder="VD: Phòng trọ, Căn hộ, Nhà nguyên căn..." className="h-11 rounded-lg" />
                    </Form.Item>
                </Form>
            </Modal>

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
                    padding: 16px !important;
                }
            `}</style>
        </div>
    );
};

export default CategoryManagement;
