import { useState } from 'react';
import { Avatar, Button, Input, Form, DatePicker, message, Upload, Divider } from 'antd';
import { User, Mail, Phone, MapPin, Calendar, Camera, Edit3, Save } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import dayjs from 'dayjs';

const UserProfile = () => {
    const { dataUser } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    const handleSave = async (values) => {
        // TODO: Implement API call to update profile
        console.log('Saving profile:', values);
        message.success('Cập nhật thông tin thành công!');
        setIsEditing(false);
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h1>
                <p className="text-gray-500">Quản lý thông tin hồ sơ của bạn</p>
            </div>

            {/* Profile Card */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Avatar
                            size={100}
                            className="!bg-white !text-orange-500 !text-3xl !font-bold border-4 border-white/30"
                            src={dataUser?.avatar}
                        >
                            {dataUser?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all">
                            <Camera size={16} className="text-orange-500" />
                        </button>
                    </div>
                    <div className="text-white">
                        <h2 className="text-2xl font-bold">{dataUser?.fullName || 'Người dùng'}</h2>
                        <p className="text-orange-100">{dataUser?.email || 'user@example.com'}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Thành viên</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Thông tin chi tiết</h3>
                    <Button
                        type={isEditing ? 'primary' : 'default'}
                        icon={isEditing ? <Save size={16} /> : <Edit3 size={16} />}
                        onClick={() => {
                            if (isEditing) {
                                form.submit();
                            } else {
                                setIsEditing(true);
                            }
                        }}
                        className={isEditing ? '!bg-orange-500 hover:!bg-orange-600 !border-none' : ''}
                    >
                        {isEditing ? 'Lưu thay đổi' : 'Chỉnh sửa'}
                    </Button>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={{
                        fullName: dataUser?.fullName || '',
                        email: dataUser?.email || '',
                        phone: dataUser?.phone || '',
                        address: dataUser?.address || '',
                        birthday: dataUser?.birthday ? dayjs(dataUser.birthday) : null,
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Form.Item
                            label={
                                <span className="flex items-center gap-2 text-gray-600">
                                    <User size={16} /> Họ và tên
                                </span>
                            }
                            name="fullName"
                        >
                            <Input disabled={!isEditing} placeholder="Nhập họ và tên" className="!h-12 !rounded-xl" />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span className="flex items-center gap-2 text-gray-600">
                                    <Mail size={16} /> Email
                                </span>
                            }
                            name="email"
                        >
                            <Input disabled placeholder="Email" className="!h-12 !rounded-xl !bg-gray-50" />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span className="flex items-center gap-2 text-gray-600">
                                    <Phone size={16} /> Số điện thoại
                                </span>
                            }
                            name="phone"
                        >
                            <Input
                                disabled={!isEditing}
                                placeholder="Nhập số điện thoại"
                                className="!h-12 !rounded-xl"
                            />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span className="flex items-center gap-2 text-gray-600">
                                    <Calendar size={16} /> Ngày sinh
                                </span>
                            }
                            name="birthday"
                        >
                            <DatePicker
                                disabled={!isEditing}
                                placeholder="Chọn ngày sinh"
                                className="!w-full !h-12 !rounded-xl"
                                format="DD/MM/YYYY"
                            />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span className="flex items-center gap-2 text-gray-600">
                                    <MapPin size={16} /> Địa chỉ
                                </span>
                            }
                            name="address"
                            className="md:col-span-2"
                        >
                            <Input disabled={!isEditing} placeholder="Nhập địa chỉ" className="!h-12 !rounded-xl" />
                        </Form.Item>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end gap-3 mt-4">
                            <Button
                                onClick={() => {
                                    setIsEditing(false);
                                    form.resetFields();
                                }}
                            >
                                Hủy
                            </Button>
                        </div>
                    )}
                </Form>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Bảo mật</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                        <p className="font-medium text-gray-800">Mật khẩu</p>
                        <p className="text-sm text-gray-500">Thay đổi mật khẩu định kỳ để bảo vệ tài khoản</p>
                    </div>
                    <Button className="!border-orange-500 !text-orange-500 hover:!bg-orange-50">Đổi mật khẩu</Button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
