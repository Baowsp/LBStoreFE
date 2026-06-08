import { ADMIN_API_BASE_URL, fetchAdminWithAuth, handleAdminResponse } from '../core/adminClient';

export const adminFetchDashboardStats = async () => {
  const [ordersPage, usersPage, productsPage] = await Promise.all([
    fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/online-orders?page=0&size=5`).then(r => handleAdminResponse<any>(r)),
    fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/users?page=0&size=1`).then(r => handleAdminResponse<any>(r)),
    fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/products?page=0&size=1`).then(r => handleAdminResponse<any>(r)),
  ]);

  const recentOrders = (ordersPage.content ?? []) as any[];
  const totalRevenue = recentOrders.reduce((sum: number, o: any) => sum + (Number(o.finalAmount) || 0), 0);

  return {
    totalOrders: ordersPage.totalElements ?? 0,
    totalUsers: usersPage.totalElements ?? 0,
    totalProducts: productsPage.totalElements ?? 0,
    totalRevenue,
    recentOrders: recentOrders.slice(0, 5),
  };
};
