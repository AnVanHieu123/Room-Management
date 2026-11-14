import { useState } from 'react';
import { Layout, Menu, Avatar, Divider } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { User, Home, Heart, LogOut, ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import Header from '../../components/Header';

import { message } from 'antd';
import Cookies from 'js-cookie';
import { requestLogout } from '../../config/UserRequest';

const { Sider, Content } = Layout;

const UserLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { dataUser, setDataUser } = useStore();

    const menuItems = [
        {
            key: '/user/profile',
            icon: <User size={20} />,
            label: 'Thông tin cá nhân',
        },
        {
            key: '/user/bookings',
            icon: <CalendarCheck size={20} />,
            label: 'Phòng trọ đã thuê',
        },
        {
            key: '/user/saved',
            icon: <Heart size={20} />,
            label: 'Phòng trọ đã lưu',
        },
    ];

    const handleMenuClick = (e) => {
        navigate(e.key);
    };

    const handleLogout = async () => {
        try {
            await requestLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            Cookies.remove('logged');
            Cookies.remove('token');
            Cookies.remove('refreshToken');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            if (setDataUser) setDataUser({});
            message.success('Đã đăng xuất thành công');
            navigate('/login');
        }
    };

    return (
        <>
            <Header />
            <Layout className="h-[calc(100vh-5rem)] overflow-hidden bg-gray-50">
                {/* Sidebar */}
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    trigger={null}
                    width={280}
                    collapsedWidth={80}
                    className="!bg-white shadow-xl fixed left-0 top-0 bottom-0 z-50"
                >
                    {/* Header with Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                        {!collapsed && (
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                                    <Home className="text-white" size={22} />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-800">Phòng Trọ</h1>
                                    <p className="text-xs text-gray-400">Tài khoản của tôi</p>
                                </div>
                            </div>
                        )}
                        {collapsed && (
                            <div
                                className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 mx-auto cursor-pointer"
                                onClick={() => navigate('/')}
                            >
                                <Home className="text-white" size={22} />
                            </div>
                        )}
                    </div>

                    {/* User Info Section */}
                    <div className={`p-4 ${collapsed ? 'px-2' : ''}`}>
                        <div
                            className={`flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl ${
                                collapsed ? 'justify-center' : ''
                            }`}
                        >
                            <Avatar
                                size={collapsed ? 40 : 48}
                                className="!bg-orange-500 !flex-shrink-0"
                                src={dataUser?.avatar}
                            >
                                {dataUser?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                            {!collapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 truncate">
                                        {dataUser?.fullName || 'Người dùng'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {dataUser?.email || 'user@example.com'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <div className="px-3">
                        <Menu
                            mode="inline"
                            selectedKeys={[location.pathname]}
                            items={menuItems}
                            onClick={handleMenuClick}
                            className="!border-none user-sidebar-menu"
                        />
                    </div>

                    {/* Divider */}
                    <Divider className="!my-4" />

                    {/* Logout Button */}
                    <div className="px-3">
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all ${
                                collapsed ? 'justify-center' : ''
                            }`}
                        >
                            <LogOut size={20} />
                            {!collapsed && <span className="font-medium">Đăng xuất</span>}
                        </button>
                    </div>

                    {/* Back to Home */}
                    <div className="px-3 mt-2">
                        <button
                            onClick={() => navigate('/')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-all ${
                                collapsed ? 'justify-center' : ''
                            }`}
                        >
                            <Home size={20} />
                            {!collapsed && <span className="font-medium">Về trang chủ</span>}
                        </button>
                    </div>

                    {/* Collapse Toggle Button */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:border-orange-300"
                    >
                        {collapsed ? (
                            <ChevronRight size={14} className="text-gray-600" />
                        ) : (
                            <ChevronLeft size={14} className="text-gray-600" />
                        )}
                    </button>

                    {/* Footer */}
                    {!collapsed && (
                        <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                                <p className="text-sm font-medium mb-1">Cần hỗ trợ?</p>
                                <p className="text-xs opacity-80">Liên hệ hotline: 1900 xxxx</p>
                            </div>
                        </div>
                    )}
                </Sider>

                {/* Main Content */}
                <Layout className="transition-all  duration-300" style={{ marginLeft: '15px' }}>
                    <Content>
                        <div className="bg-white rounded-2xl shadow-sm min-h-[calc(100vh-48px)] p-6">
                            <Outlet />
                        </div>
                    </Content>
                </Layout>

                {/* Custom Styles */}
                <style>{`
                .user-sidebar-menu .ant-menu-item {
                    margin: 4px 0 !important;
                    border-radius: 12px !important;
                    height: 48px !important;
                    display: flex !important;
                    align-items: center !important;
                }
                
                .user-sidebar-menu .ant-menu-item:hover {
                    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%) !important;
                    color: #f97316 !important;
                }
                
                .user-sidebar-menu .ant-menu-item-selected {
                    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%) !important;
                    color: #f97316 !important;
                    font-weight: 600 !important;
                }
                
                .user-sidebar-menu .ant-menu-item-selected::after {
                    display: none !important;
                }
                
                .user-sidebar-menu .ant-menu-item .ant-menu-item-icon {
                    color: inherit !important;
                }
            `}</style>
            </Layout>
        </>
    );
};

export default UserLayout;
