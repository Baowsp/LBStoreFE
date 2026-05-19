import React from 'react';
import { useCartStore } from '../store/useCartStore';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import {Link} from "react-router-dom";
export const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, totalPrice, toggleItemSelection, toggleAllSelection } = useCartStore();
  const allSelected = cart.length > 0 && cart.every(item => item.isSelected !== false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống</p>
        <Link to= "/">
        <button className="bg-cps text-white px-6 py-2 rounded-lg font-bold">Quay lại mua sắm</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Link to="/" className="flex items-center gap-2 mb-6 cursor-pointer text-gray-600">
        <ArrowLeft size={20} />
        <span className="font-semibold">Trở về</span>
      </Link>

      <h1 className="text-xl font-bold mb-6 uppercase text-center">Giỏ hàng của bạn</h1>

      <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={allSelected} 
            onChange={toggleAllSelection}
            className="w-5 h-5 accent-red-600 rounded cursor-pointer"
          />
          <span className="font-bold text-gray-800 text-sm w-full">Chọn tất cả ({cart.length} sản phẩm)</span>
        </label>
        <span className="text-gray-400 text-sm font-medium hover:text-red-600 cursor-pointer" onClick={toggleAllSelection}>Bỏ chọn tất cả</span>
      </div>

      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item.cartItemId} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 border border-gray-100">
            <input 
              type="checkbox" 
              checked={item.isSelected !== false} 
              onChange={() => toggleItemSelection(item.cartItemId)}
              className="w-5 h-5 accent-red-600 rounded cursor-pointer self-start mt-3 block"
            />
            <img src={item.image} alt={item.name} className="w-20 h-20 object-contain block" />
            
            <div className="flex-1">
              <h3 className="font-bold text-sm text-gray-800">{item.name}</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {item.selectedStorage && <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold">{item.selectedStorage}</span>}
                {item.selectedRam && <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold">RAM {item.selectedRam}</span>}
                {item.selectedColor && <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold">Màu: {item.selectedColor}</span>}
              </div>
              <p className="text-red-600 font-bold mt-1">{item.price.toLocaleString()}đ</p>
              
              <div className="flex items-center justify-between mt-3">
                {/* Bộ tăng giảm số lượng */}
                <div className="flex flex-col">
                  <div className="flex items-center border rounded-lg w-max mb-1">
                    <button onClick={() => updateQuantity(item.cartItemId, -1)} className="p-1 px-2 hover:bg-gray-100"><Minus size={14} /></button>
                    <span className="px-3 font-bold text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.cartItemId, 1)} 
                      disabled={item.quantity >= item.maxQuantity}
                      className="p-1 px-2 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {item.quantity >= item.maxQuantity && (
                    <span className="text-[10px] text-red-500 font-bold max-w-[80px] leading-tight">Đã đạt tối đa ({item.maxQuantity})</span>
                  )}
                </div>

                <button onClick={() => removeFromCart(item.cartItemId)} className="text-gray-400 hover:text-red-600">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-md border-t-4 border-cps">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium text-gray-600">Tổng tiền tạm tính (sản phẩm đã chọn):</span>
          <span className="text-xl font-bold text-red-600">{totalPrice().toLocaleString()}đ</span>
        </div>
        <Link to="/checkout">
          <button className="w-full bg-cps text-white py-3 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors uppercase">
            Tiến hành đặt hàng ({cart.filter(i => i.isSelected !== false).length} sản phẩm)
          </button>
        </Link>
      </div>
    </div>
  );
};