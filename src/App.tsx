import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CartPage } from './pages/CartPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AdminLayout } from './layouts/AdminLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { CheckoutPage } from './pages/CheckoutPage';
import { Dashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminProductAdd } from './pages/admin/AdminProductAdd';
import { AdminProductEdit } from './pages/admin/AdminProductEdit';
import { AdminUsers } from './pages/admin/AdminUser';
import { AdminUserAdd } from './pages/admin/AdminUserAdd';
import { AdminUserEdit } from './pages/admin/AdminUserEdit';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminOrderDetail } from './pages/admin/AdminOrderDetail';
import { AdminStockIn } from './pages/admin/AdminStockIn';
import { ProfilePage } from './pages/ProfilePage';
import { AdminSuppliers } from './pages/admin/AdminSuppliers';
import { AdminSupplierAdd } from './pages/admin/AdminSupplierAdd';
import { AdminSupplierEdit } from './pages/admin/AdminSupplierEdit';
import { AdminWarranty } from './pages/admin/AdminWarranty';
import { AdminWarrantyAdd } from './pages/admin/AdminWarrantyAdd';
import { AdminWarrantyEdit } from './pages/admin/AdminWarrantyEdit';
import { AdminBanners } from './pages/admin/AdminBanners';
import { AdminBannerAdd } from './pages/admin/AdminBannerAdd';
import { AdminBannerEdit } from './pages/admin/AdminBannerEdit';
import { AdminVouchers } from './pages/admin/AdminVouchers';
import { AdminVoucherAdd } from './pages/admin/AdminVoucherAdd';
import { AdminVoucherEdit } from './pages/admin/AdminVoucherEdit';
import { AdminDisplayBanners } from './pages/admin/AdminDisplayBanners';
import { AuthGuard } from './components/AuthGuard';
import { AdminLoginPage } from './pages/AdminLoginPage';
function App() {
  return (
    <Router>
      <Routes>
        {/* Layout cho khách hàng (có Header/Footer) */}
        <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path='forgot-password' element= {<ForgotPasswordPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/success" element={<CheckoutPage />} />
            <Route path="/checkout/cancel" element={<CheckoutPage />} />
        </Route>

        {/* Layout cho Admin - BẢO VỆ BỞI AUTHGUARD */}
        <Route path="/admin" element={<AuthGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/add" element={<AdminProductAdd />} />
            <Route path="products/edit/:id" element={<AdminProductEdit />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/add" element={<AdminUserAdd />} />
            <Route path="users/edit/:id" element={<AdminUserEdit />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="stock-in" element={<AdminStockIn />} />
            <Route path="suppliers" element={<AdminSuppliers />} />
            <Route path="suppliers/add" element={<AdminSupplierAdd />} />
            <Route path="suppliers/edit/:id" element={<AdminSupplierEdit />} />
            <Route path="warranties" element={<AdminWarranty />} />
            <Route path="warranties/add" element={<AdminWarrantyAdd />} />
            <Route path="warranties/edit/:id" element={<AdminWarrantyEdit />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="banners/add" element={<AdminBannerAdd />} />
            <Route path="banners/edit/:id" element={<AdminBannerEdit />} />
            <Route path="display-banners" element={<AdminDisplayBanners />} />
            <Route path="vouchers" element={<AdminVouchers />} />
            <Route path="vouchers/add" element={<AdminVoucherAdd />} />
            <Route path="vouchers/edit/:id" element={<AdminVoucherEdit />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;