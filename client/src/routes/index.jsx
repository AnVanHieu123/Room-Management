import App from '../App';
import AdminLayout from '../pages/admin/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import CategoryManagement from '../pages/admin/CategoryManagement';
import RoomManagement from '../pages/admin/RoomManagement';
import BookingManagement from '../pages/admin/BookingManagement';
import UserLayout from '../pages/user/UserLayout';
import UserProfile from '../pages/user/UserProfile';
import UserBookings from '../pages/user/UserBookings';
import UserSavedRooms from '../pages/user/UserSavedRooms';
import LoginUser from '../pages/LoginUser';
import RegisterUser from '../pages/RegisterUser';
import DetailRoom from '../pages/DetailRoom';
import BlogAdmin from '../pages/admin/BlogAdmin';
import ListBlogPage from '../pages/Blog';
import DetailBlogPage from '../pages/DetailBlogPage';
import ForgotPassword from '../pages/ForgotPassword';

export const publicRoutes = [
    {
        path: '/',
        title: 'Trang chủ',
        element: <App />,
    },
    {
        path: '/login',
        title: 'Đăng nhập',
        element: <LoginUser />,
    },
    {
        path: '/register',
        title: 'Đăng ký',
        element: <RegisterUser />,
    },
    {
        path: '/detail/:id',
        title: 'Chi tiết phòng',
        element: <DetailRoom />,
    },
    {
        path: '/blog',
        title: 'Bài viết',
        element: <ListBlogPage />,
    },
    {
        path: '/forgot-password',
        title: 'Quên mật khẩu',
        element: <ForgotPassword />,
    },
    {
        path: '/blog/:id',
        title: 'Bài viết',
        element: <DetailBlogPage />,
    },
];

import AdminRoute from '../components/AdminRoute';
import UserRoute from '../components/UserRoute';

export const userRoutes = [
    {
        path: '/user',
        element: (
            <UserRoute>
                <UserLayout />
            </UserRoute>
        ),
        children: [
            {
                index: true,
                element: <UserProfile />,
            },
            {
                path: 'profile',
                element: <UserProfile />,
            },
            {
                path: 'bookings',
                element: <UserBookings />,
            },
            {
                path: 'saved',
                element: <UserSavedRooms />,
            },
        ],
    },
];

export const adminRoutes = [
    {
        path: '/admin',
        element: (
            <AdminRoute>
                <AdminLayout />
            </AdminRoute>
        ),
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
            {
                path: 'categories',
                element: <CategoryManagement />,
            },
            {
                path: 'rooms',
                element: <RoomManagement />,
            },
            {
                path: 'bookings',
                element: <BookingManagement />,
            },
            {
                path: 'blog',
                element: <BlogAdmin />,
            },
        ],
    },
];

export const routes = [...publicRoutes, ...userRoutes, ...adminRoutes];
