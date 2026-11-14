import { useEffect, useRef } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Spin, message } from 'antd';
import Cookies from 'js-cookie';
import { useStore } from '../hooks/useStore';

const UserRoute = ({ children }) => {
    const { dataUser, loadingAuth } = useStore();
    const location = useLocation();
    const alertedRef = useRef(false);

    const isLoggedIn = Cookies.get('logged') === '1' || !!dataUser?._id;

    useEffect(() => {
        if (loadingAuth) return;

        if (!isLoggedIn && !alertedRef.current) {
            alertedRef.current = true;
            message.warning('Vui lòng đăng nhập để truy cập trang này');
        }
    }, [loadingAuth, isLoggedIn]);

    if (loadingAuth) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Spin size="large" />
                <p className="mt-4 text-gray-500 font-medium text-sm">Đang tải thông tin tài khoản...</p>
            </div>
        );
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children ? children : <Outlet />;
};

export default UserRoute;
