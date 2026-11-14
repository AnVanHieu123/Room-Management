import { useEffect, useRef } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Spin, message } from 'antd';
import Cookies from 'js-cookie';
import { useStore } from '../hooks/useStore';

const AdminRoute = ({ children }) => {
    const { dataUser, loadingAuth } = useStore();
    const location = useLocation();
    const alertedRef = useRef(false);

    const isLoggedIn = Cookies.get('logged') === '1' || !!dataUser?._id;
    const isAdmin = dataUser?.role === 'admin' || dataUser?.isAdmin === true;

    useEffect(() => {
        if (loadingAuth) return;

        if (!isLoggedIn && !alertedRef.current) {
            alertedRef.current = true;
            message.warning('Vui lòng đăng nhập với tài khoản Admin để truy cập trang quản trị');
        } else if (isLoggedIn && !isAdmin && !alertedRef.current) {
            alertedRef.current = true;
            message.error('Bạn không có quyền truy cập trang quản trị (Admin only)!');
        }
    }, [loadingAuth, isLoggedIn, isAdmin]);

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

    return children ? children : <Outlet />;
};

export default AdminRoute;
