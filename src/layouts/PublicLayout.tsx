import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CustomerChatWidget } from '../components/chat/CustomerChatWidget';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
      <CustomerChatWidget />
    </div>
  );
};