import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const AuthGuard = () => {
    const { isAuthenticated, user } = useAuthStore();

    // Nếu chưa đăng nhập hoặc không phải ADMIN, đẩy về trang login admin
    if (!isAuthenticated || user?.role !== 'ADMIN') {
        console.warn("Unauthorized access attempt to Admin area. Redirecting to admin-login.");
        return <Navigate to="/admin-login" replace />;
    }

    return <Outlet />;
};
