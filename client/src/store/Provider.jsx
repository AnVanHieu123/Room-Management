import Context from './Context';
import CryptoJS from 'crypto-js';

import cookies from 'js-cookie';

import { useEffect, useState, useRef } from 'react';
import { requestAuth } from '../config/UserRequest';
import { ToastContainer } from 'react-toastify';
import { requestGetNotificationByUserId } from '../config/NotificationRequest';

import { io } from 'socket.io-client';

export function Provider({ children }) {
    const [dataUser, setDataUser] = useState({});
    const [loadingAuth, setLoadingAuth] = useState(cookies.get('logged') === '1');
    const [notification, setNotification] = useState([]);

    const socketRef = useRef(null);

    const fetchAuth = async () => {
        try {
            const res = await requestAuth();
            const bytes = CryptoJS.AES.decrypt(res.metadata, import.meta.env.VITE_SECRET_CRYPTO);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            if (!originalText) {
                console.error('Failed to decrypt data');
                return;
            }
            const user = JSON.parse(originalText);
            setDataUser(user);
        } catch (error) {
            console.error('Auth error:', error);
            setDataUser({});
        } finally {
            setLoadingAuth(false);
        }
    };

    const fetchNotification = async () => {
        try {
            const res = await requestGetNotificationByUserId();
            setNotification(res.metadata);
        } catch (error) {
            console.error('Notification error:', error);
        }
    };

    useEffect(() => {
        if (!dataUser._id) return;

        const socket = io(import.meta.env.VITE_API_URL, {
            withCredentials: true,
        });

        socket.on('notification', (data) => {
            setNotification((prev) => [data, ...prev]);
            // toast.success('Bạn có thông báo mới');
        });

        socket.on('new_favourite', (data) => {
            setNotification((prev) => [data, ...prev]);
            // toast.success('Bạn có thông báo mới');
        });

        socket.on('approveBooking', (data) => {
            setNotification((prev) => [data, ...prev]);
            // toast.success('Bạn có thông báo mới');
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [dataUser._id]);

    useEffect(() => {
        const token = cookies.get('logged');

        if (!token) {
            setLoadingAuth(false);
            return;
        }
        fetchAuth();
        fetchNotification();
    }, []);

    return (
        <Context.Provider
            value={{
                dataUser,
                setDataUser,
                loadingAuth,
                notification,
            }}
        >
            {children}
            <ToastContainer />
        </Context.Provider>
    );
}
