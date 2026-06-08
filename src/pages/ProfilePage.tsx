import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import {
  fetchCustomerByUserId,
  fetchAddressesByCustomerId,
  fetchWarrantyByCustomerId,
  createAddress,
  deleteAddress,
  updateUserProfile,
  changeUserPassword,
  fetchUserById,
  fetchOnlineOrdersByCustomer,
  confirmOrderDelivered
} from '../services/api';

import { ProfileSidebar } from '../components/profile/ProfileSidebar';
import { AccountTab } from '../components/profile/AccountTab';
import { OrdersTab } from '../components/profile/OrdersTab';
import { WarrantyTab } from '../components/profile/WarrantyTab';
import { AddressTab } from '../components/profile/AddressTab';
import { PasswordTab } from '../components/profile/PasswordTab';
import { OrderDetailModal } from '../components/profile/OrderDetailModal';

export const ProfilePage = () => {
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('account');

  // States
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [userInfo, setUserInfo] = useState({
    name: user?.fullName || "Chưa cập nhật",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    memberClass: customerInfo?.grade || "MEMBER",
    points: customerInfo?.rewardPoints || 0,
  });

  const [warrantyItems, setWarrantyItems] = useState<any[]>([]);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', address: '', province: '', district: '', ward: '' });

  // Purchase History States
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<any>(null);

  // Password Update States
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const loadLatestUser = async () => {
      if (user?.id) {
        const latest = await fetchUserById(user.id);
        if (latest) {
          useAuthStore.getState().updateUser(latest);
          setUserInfo(prev => ({
            ...prev,
            name: latest.fullName,
            email: latest.email,
            phone: latest.phoneNumber,
            memberClass: latest.role
          }));
        }
      }
    };

    if (user?.id) {
      loadLatestUser();

      // Fetch Customer
      fetchCustomerByUserId(user.id).then((customer) => {
        if (customer) {
          setCustomerInfo(customer);
          setUserInfo(prev => ({ ...prev, memberClass: customer.grade, points: customer.rewardPoints }));

          // Fetch Addresses
          fetchAddressesByCustomerId(customer.id).then(setAddresses);

          // Fetch Warranty Tickets
          fetchWarrantyByCustomerId(customer.id).then(setWarrantyItems);

          // Fetch Purchase History
          setLoadingOrders(true);
          fetchOnlineOrdersByCustomer(customer.id)
            .then(data => {
              // Sắp xếp đơn hàng mới nhất lên đầu
              const sorted = (data || []).sort((a, b) =>
                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
              );
              setOrders(sorted);
            })
            .finally(() => setLoadingOrders(false));
        }
      });
    }
  }, [user?.id, token]);

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    try {
      await updateUserProfile(user.id, {
        fullName: userInfo.name,
        phoneNumber: userInfo.phone,
        email: userInfo.email
      });
      alert("Cập nhật thành công!");
      useAuthStore.setState({ user: { ...user, fullName: userInfo.name, phoneNumber: userInfo.phone } });
    } catch (e: any) {
      alert("Lỗi cập nhật: " + e.message);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo?.id) return alert("Vui lòng đợi tải thông tin khách hàng");

    if (newAddress.name && newAddress.phone && newAddress.address) {
      try {
        const payload = {
          customer: { id: customerInfo.id },
          receiverName: newAddress.name,
          receiverPhone: newAddress.phone,
          streetAddress: newAddress.address,
          province: newAddress.province || "Khác",
          district: newAddress.district || "Khác",
          ward: newAddress.ward || "Khác",
          addressType: "HOME",
          isDefault: addresses.length === 0
        };
        const added = await createAddress(payload);
        setAddresses([...addresses, added]);
        setNewAddress({ name: '', phone: '', address: '', province: '', district: '', ward: '' });
        setShowAddAddress(false);
      } catch (e) {
        alert("Thêm địa chỉ thất bại!");
      }
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (confirm("Xóa địa chỉ này?")) {
      const ok = await deleteAddress(id);
      if (ok) {
        setAddresses(addresses.filter(a => a.id !== id));
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return alert("Mật khẩu xác nhận không khớp!");
    }
    try {
      if (user?.id) {
        await changeUserPassword(user.id, passwordForm.oldPassword, passwordForm.newPassword);
        alert("Đổi mật khẩu thành công!");
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err: any) {
      alert(err.message || "Đổi mật khẩu thất bại");
    }
  };

  const handleConfirmDelivered = async (orderId: string) => {
    if (!window.confirm('Xác nhận bạn đã nhận được hàng?')) return;
    try {
      await confirmOrderDelivered(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'DELIVERED' } : o));
      if (selectedOrderForModal?.id === orderId) {
        setSelectedOrderForModal((prev: any) => prev ? { ...prev, status: 'DELIVERED' } : prev);
      }
      alert('Xác nhận nhận hàng thành công!');
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
  };

  if (!user && !token) {
    return <div className="text-center py-20 font-bold">Vui lòng đăng nhập để xem hồ sơ.</div>;
  }

  return (
    <div className="bg-[#f4f4f4] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <ProfileSidebar
            userInfo={userInfo}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <div className="lg:col-span-9 space-y-6">
            {activeTab === 'account' && (
              <AccountTab
                userInfo={userInfo}
                setUserInfo={setUserInfo}
                handleUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersTab
                orders={orders}
                loadingOrders={loadingOrders}
                setSelectedOrderForModal={setSelectedOrderForModal}
                onConfirmDelivered={handleConfirmDelivered}
              />
            )}

            {activeTab === 'warranty' && (
              <WarrantyTab
                warrantyItems={warrantyItems}
              />
            )}

            {activeTab === 'address' && (
              <AddressTab
                addresses={addresses}
                showAddAddress={showAddAddress}
                setShowAddAddress={setShowAddAddress}
                newAddress={newAddress}
                setNewAddress={setNewAddress}
                handleAddAddress={handleAddAddress}
                handleDeleteAddress={handleDeleteAddress}
              />
            )}

            {activeTab === 'password' && (
              <PasswordTab
                passwordForm={passwordForm}
                setPasswordForm={setPasswordForm}
                handleChangePassword={handleChangePassword}
              />
            )}
          </div>
        </div>
      </div>

      {selectedOrderForModal && (
        <OrderDetailModal
          order={selectedOrderForModal}
          onClose={() => setSelectedOrderForModal(null)}
          onConfirmDelivered={handleConfirmDelivered}
        />
      )}
    </div>
  );
};