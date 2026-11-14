import { useState } from 'react';
import { Form, Input, Button, Checkbox, Divider, message } from 'antd';
import { Mail, Lock, Eye, EyeOff, Home, ArrowRight, User, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Header from '../components/Header';
import { requestRegister, requestLoginGoogle } from '../config/UserRequest';

function RegisterUser() {
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await requestRegister(values);
            message.success('Đăng ký thành công!');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            message.error(error.response?.data?.message || 'Đăng ký thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setGoogleLoading(true);
        try {
            if (!credentialResponse?.credential) {
                message.error('Không nhận được thông tin xác thực từ Google!');
                return;
            }
            await requestLoginGoogle({ credential: credentialResponse.credential });
            message.success('Đăng nhập bằng Google thành công!');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            console.error('Google login error:', error);
            message.error(error.response?.data?.message || 'Đăng nhập bằng Google thất bại!');
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleGoogleError = () => {
        message.error('Đăng nhập bằng Google không thành công. Vui lòng thử lại!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 relative overflow-hidden">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-50">
                <Header />
            </header>

            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-orange-300/20 rounded-full blur-2xl"></div>
            </div>

            {/* Register Card */}
            <div className="min-h-screen flex items-center justify-center p-4 pt-24 pb-12">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl transform scale-105"></div>

                    <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-10">
                        {/* Logo & Title */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-lg mb-4">
                                <Home className="text-white" size={32} />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800">Tạo tài khoản mới</h1>
                            <p className="text-gray-500 mt-2">Đăng ký để bắt đầu tìm phòng trọ</p>
                        </div>

                        {/* Register Form */}
                        <Form
                            name="register"
                            onFinish={onFinish}
                            layout="vertical"
                            requiredMark={false}
                            className="space-y-3"
                        >
                            {/* Full Name */}
                            <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                                <Input
                                    prefix={<User className="text-gray-400 mr-2" size={18} />}
                                    placeholder="Họ và tên"
                                    className="h-12 rounded-xl border-gray-200 hover:border-orange-400 focus:border-orange-500"
                                    size="large"
                                />
                            </Form.Item>

                            {/* Email */}
                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' },
                                ]}
                            >
                                <Input
                                    prefix={<Mail className="text-gray-400 mr-2" size={18} />}
                                    placeholder="Email của bạn"
                                    className="h-12 rounded-xl border-gray-200 hover:border-orange-400 focus:border-orange-500"
                                    size="large"
                                />
                            </Form.Item>

                            {/* Phone */}
                            <Form.Item
                                name="phone"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                    { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' },
                                ]}
                            >
                                <Input
                                    prefix={<Phone className="text-gray-400 mr-2" size={18} />}
                                    placeholder="Số điện thoại"
                                    className="h-12 rounded-xl border-gray-200 hover:border-orange-400 focus:border-orange-500"
                                    size="large"
                                />
                            </Form.Item>

                            {/* Password */}
                            <Form.Item
                                name="password"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                    { min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' },
                                ]}
                            >
                                <Input
                                    prefix={<Lock className="text-gray-400 mr-2" size={18} />}
                                    suffix={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    }
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Mật khẩu"
                                    className="h-12 rounded-xl border-gray-200 hover:border-orange-400 focus:border-orange-500"
                                    size="large"
                                />
                            </Form.Item>

                            {/* Confirm Password */}
                            <Form.Item
                                name="confirmPassword"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input
                                    prefix={<Lock className="text-gray-400 mr-2" size={18} />}
                                    suffix={
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    }
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Xác nhận mật khẩu"
                                    className="h-12 rounded-xl border-gray-200 hover:border-orange-400 focus:border-orange-500"
                                    size="large"
                                />
                            </Form.Item>

                            {/* Terms Checkbox */}
                            <Form.Item
                                name="agreement"
                                valuePropName="checked"
                                rules={[
                                    {
                                        validator: (_, value) =>
                                            value
                                                ? Promise.resolve()
                                                : Promise.reject(new Error('Vui lòng đồng ý với điều khoản!')),
                                    },
                                ]}
                            >
                                <Checkbox className="text-gray-600">
                                    Tôi đồng ý với{' '}
                                    <Link to="/terms" className="text-orange-500 hover:text-orange-600">
                                        Điều khoản sử dụng
                                    </Link>{' '}
                                    và{' '}
                                    <Link to="/privacy" className="text-orange-500 hover:text-orange-600">
                                        Chính sách bảo mật
                                    </Link>
                                </Checkbox>
                            </Form.Item>

                            {/* Submit Button */}
                            <Form.Item className="mb-0">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0 rounded-xl text-base font-semibold shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                                >
                                    Đăng ký
                                    <ArrowRight size={18} />
                                </Button>
                            </Form.Item>
                        </Form>

                        {/* Divider */}
                        <Divider className="my-5">
                            <span className="text-gray-400 text-sm">hoặc đăng ký với</span>
                        </Divider>

                        {/* Google Register */}
                        <div className="flex flex-col items-center justify-center w-full">
                            <div className="w-full flex justify-center [&>div]:!w-full [&_iframe]:!mx-auto">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    theme="outline"
                                    size="large"
                                    shape="rectangular"
                                    width="100%"
                                    text="signup_with"
                                    locale="vi"
                                />
                            </div>
                            {googleLoading && (
                                <p className="text-sm text-orange-500 mt-2 animate-pulse">
                                    Đang xử lý đăng ký Google...
                                </p>
                            )}
                        </div>

                        {/* Login Link */}
                        <p className="text-center mt-6 text-gray-600">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="text-orange-500 hover:text-orange-600 font-semibold">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer Text */}
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm">
                © 2024 Phòng Trọ. Tất cả quyền được bảo lưu.
            </p>
        </div>
    );
}

export default RegisterUser;
