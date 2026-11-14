import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Spin, message } from 'antd';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderTree,
    Menu as MenuIcon,
    LogOut,
    User,
    Bell,
    Settings,
    Home,
    DoorOpen,
    CalendarCheck,
} from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import Cookies from 'js-cookie';
import { requestLogout } from '../../config/UserRequest';

const { Sider, Content, Header } = Layout;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { dataUser, setDataUser, loadingAuth } = useStore();

    const isLoggedIn = Cookies.get('logged') === '1' || !!dataUser?._id;
    const isAdmin = dataUser?.role === 'admin' || dataUser?.isAdmin === true;

    const handleLogout = async () => {
        try {
            await requestLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            Cookies.remove('logged');
            Cookies.remove('token');
            Cookies.remove('refreshToken');
            if (setDataUser) setDataUser({});
            message.success('Đã đăng xuất thành công');
            navigate('/login');
        }
    };

    const menuItems = [
        {
            key: '/admin',
            icon: <LayoutDashboard size={20} />,
            label: 'Thống kê',
        },
        {
            key: '/admin/categories',
            icon: <FolderTree size={20} />,
            label: 'Quản lý danh mục',
        },
        {
            key: '/admin/rooms',
            icon: <DoorOpen size={20} />,
            label: 'Quản lý phòng trọ',
        },
        {
            key: '/admin/bookings',
            icon: <CalendarCheck size={20} />,
            label: 'Quản lý đặt phòng',
        },
        {
            key: '/admin/blog',
            icon: <CalendarCheck size={20} />,
            label: 'Quản lý blog',
        },
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <User size={16} />,
            label: 'Hồ sơ cá nhân',
            onClick: () => navigate('/user/profile'),
        },
        {
            key: 'home',
            icon: <Home size={16} />,
            label: 'Về trang chủ',
            onClick: () => navigate('/'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogOut size={16} />,
            label: 'Đăng xuất',
            danger: true,
            onClick: handleLogout,
        },
    ];

    const handleMenuClick = (e) => {
        navigate(e.key);
    };

    // Kiểm tra trạng thái tải và quyền truy cập
    if (loadingAuth) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Spin size="large" />
                <p className="mt-4 text-gray-500 font-medium text-sm">Đang xác thực quyền quản trị...</p>
            </div>
        );
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return (
        <Layout className="min-h-screen">
            {/* Sidebar */}
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                trigger={null}
                width={260}
                className="shadow-xl"
                style={{
                    background: 'linear-gradient(180deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
                }}
            >
                {/* Logo Section */}
                <div className="h-16 flex items-center justify-center border-b border-orange-400/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer" onClick={() => navigate('/')}>
                            <Home className="text-orange-500" size={24} />
                        </div>
                        {!collapsed && (
                            <div className="text-white">
                                <h1 className="text-lg font-bold leading-tight">Phòng Trọ</h1>
                                <p className="text-xs text-orange-100 opacity-80">Admin Panel</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="py-4">
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        onClick={handleMenuClick}
                        style={{
                            background: 'transparent',
                            border: 'none',
                        }}
                        className="admin-sidebar-menu"
                    />
                </div>

                {/* Sidebar Footer */}
                {!collapsed && (
                    <div className="absolute bottom-16 left-0 right-0 px-4">
                        <div className="bg-orange-400/20 backdrop-blur rounded-xl p-4 text-center text-white">
                            <p className="text-xs opacity-80">Phiên bản</p>
                            <p className="font-semibold">1.0.0</p>
                        </div>
                    </div>
                )}
            </Sider>

            <Layout>
                {/* Header */}
                <Header
                    className="px-6 flex items-center justify-between shadow-sm"
                    style={{ background: '#fff', padding: '0 24px' }}
                >
                    {/* Left side - Toggle button and breadcrumb */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-orange-100 flex items-center justify-center transition-all duration-300 hover:text-orange-500 cursor-pointer"
                        >
                            <MenuIcon size={20} />
                        </button>
                        <div className="hidden md:block">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {menuItems.find((item) => item.key === location.pathname)?.label || 'Dashboard'}
                            </h2>
                        </div>
                    </div>

                    {/* Right side - Notifications and User */}
                    <div className="flex items-center gap-4">
                        {/* User Dropdown */}
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-all">
                                <Avatar size={40} className="bg-orange-500" src={dataUser?.avatar} icon={<User size={20} />}>
                                    {dataUser?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                                </Avatar>
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium text-gray-800 leading-tight">
                                        {dataUser?.fullName || 'Admin'}
                                    </p>
                                    <p className="text-xs text-orange-500 font-semibold">Quản trị viên</p>
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                {/* Main Content */}
                <Content className="m-6">
                    <div className="bg-white rounded-2xl shadow-sm min-h-[calc(100vh-140px)] p-6">
                        <Outlet />
                    </div>
                </Content>
            </Layout>

            {/* Custom Styles */}
            <style>{`
                .admin-sidebar-menu .ant-menu-item {
                    margin: 4px 12px !important;
                    border-radius: 12px !important;
                    color: rgba(255, 255, 255, 0.85) !important;
                    height: 48px !important;
                    display: flex !important;
                    align-items: center !important;
                }
                
                .admin-sidebar-menu .ant-menu-item:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    color: #fff !important;
                }
                
                .admin-sidebar-menu .ant-menu-item-selected {
                    background: rgba(255, 255, 255, 0.25) !important;
                    color: #fff !important;
                    font-weight: 600 !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .admin-sidebar-menu .ant-menu-item .ant-menu-item-icon {
                    color: inherit !important;
                }

                .ant-layout-sider-trigger {
                    background: rgba(255, 255, 255, 0.1) !important;
                }
            `}</style>
        </Layout>
    );
};

export default AdminLayout;
