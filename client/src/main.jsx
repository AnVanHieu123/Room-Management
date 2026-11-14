import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { routes } from './routes/index.jsx';
import './index.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { Provider } from './store/Provider.jsx';
import ChatbotWidget from './components/ChatbotWidget.jsx';

const renderRoutes = (routes) => {
    return routes.map((route) => {
        if (route.children) {
            return (
                <Route key={route.path} path={route.path} element={route.element}>
                    {route.children.map((child) => (
                        <Route
                            key={child.path || 'index'}
                            path={child.path}
                            index={child.index}
                            element={child.element}
                        />
                    ))}
                </Route>
            );
        }
        return <Route key={route.path} path={route.path} element={route.element} />;
    });
};

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID || ''}>
            <Provider>
                <Router>
                    <Routes>{renderRoutes(routes)}</Routes>
                    <ChatbotWidget />
                </Router>
            </Provider>
        </GoogleOAuthProvider>
    </StrictMode>,
);
