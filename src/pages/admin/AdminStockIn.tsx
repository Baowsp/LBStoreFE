import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, Save, History, Plus, X, ArrowLeft, Trash2 } from 'lucide-react';

export const AdminStockIn = () => {
  const navigate = useNavigate();
  // Danh sách nhà cung cấp giả lập
  const [suppliers] = useState([
    { id: 1, name: "Apple Vietnam LLC" },
    { id: 2, name: "Samsung Vina Electronics" },
    { id: 3, name: "Công ty Cổ phần Phân phối FPT" },
    { id: 4, name: "Sony Electronics Vietnam" },
    { id: 5, name: "Digiworld Corporation" },
  ]);

  // Danh sách sản phẩm giả lập (chuyển vào state để có thể thêm mới)
  const [products, setProducts] = useState([
    { id: 1, name: "iPhone 15 Pro Max", stock: 12 },
    { id: 2, name: "Samsung Galaxy S24 Ultra", stock: 8 },
    { id: 3, name: "MacBook Air M3", stock: 5 },
    { id: 4, name: "iPad Pro M4", stock: 15 },
    { id: 5, name: "Sony WH-1000XM5", stock: 20 },
  ]);

  const [history, setHistory] = useState([
    { id: 1, product: "iPhone 15 Pro Max", quantity: 10, importPrice: 24000000, date: "20/10/2023", supplier: "Apple Vietnam LLC", note: "Nhập hàng đợt 1" },
    { id: 2, product: "Samsung Galaxy S24 Ultra", quantity: 5, importPrice: 21000000, date: "19/10/2023", supplier: "Samsung Vina Electronics", note: "" },
  ]);

  // --- STATE QUẢN LÝ QUY TRÌNH NHẬP KHO ---
  const [step, setStep] = useState(1); // 1: Chọn NCC, 2: Nhập chi tiết phiếu
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  
  // Dữ liệu phiếu nhập đang tạo
  const [receiptItems, setReceiptItems] = useState<any[]>([]);
  const [receiptTotal, setReceiptTotal] = useState(0);
  const [receiptNote, setReceiptNote] = useState('');

  // Form thêm từng sản phẩm vào phiếu
  const [itemForm, setItemForm] = useState({
    productId: '',
    isNew: false,
    newProductName: '',
    quantity: 1,
    importPrice: 0,
    salePrice: 0
  });

  // Tự động tính tổng tiền khi danh sách item thay đổi
  useEffect(() => {
    const total = receiptItems.reduce((sum, item) => sum + (item.importPrice * item.quantity), 0);
    setReceiptTotal(total);
  }, [receiptItems]);

  const handleStartReceipt = () => {
    if (!selectedSupplierId) return alert("Vui lòng chọn nhà cung cấp!");
    setStep(2);
    setReceiptItems([]);
    setReceiptNote('');
  };

  const handleAddItem = () => {
    let productName = "";
    let productId = itemForm.productId;

    if (itemForm.isNew) {
      if (!itemForm.newProductName) return alert("Vui lòng nhập tên sản phẩm mới");
      productName = itemForm.newProductName;
      productId = `new_${Date.now()}`; // ID tạm
    } else {
      if (!itemForm.productId) return alert("Vui lòng chọn sản phẩm");
      const p = products.find(pr => pr.id === Number(itemForm.productId));
      if (p) productName = p.name;
    }

    const newItem = {
      id: Date.now(),
      productId,
      productName,
      isNew: itemForm.isNew,
      quantity: itemForm.quantity,
      importPrice: itemForm.importPrice,
      salePrice: itemForm.salePrice
    };

    setReceiptItems([...receiptItems, newItem]);
    setItemForm({ productId: '', isNew: false, newProductName: '', quantity: 1, importPrice: 0, salePrice: 0 });
  };

  const handleRemoveItem = (id: number) => {
    setReceiptItems(receiptItems.filter(i => i.id !== id));
  };

  const handleSaveReceipt = () => {
    if (receiptItems.length === 0) return alert("Phiếu nhập chưa có sản phẩm nào!");
    
    const supplier = suppliers.find(s => s.id === Number(selectedSupplierId));
    const date = new Date().toLocaleDateString('vi-VN');
    
    // Trong thực tế: Gọi API lưu phiếu nhập (Receipt) và chi tiết (ReceiptItems)
    // Ở đây giả lập: Lưu từng item vào lịch sử và cập nhật kho
    
    const newProducts = [...products];
    const newHistoryItems = receiptItems.map(item => {
      // Cập nhật kho
      if (item.isNew) {
        newProducts.push({ id: Date.now() + Math.random(), name: item.productName, stock: item.quantity });
      } else {
        const pIndex = newProducts.findIndex(p => p.id === Number(item.productId));
        if (pIndex !== -1) newProducts[pIndex].stock += item.quantity;
      }

      return {
        id: Date.now() + Math.random(),
        product: item.productName,
        quantity: item.quantity,
        importPrice: item.importPrice,
        date: date,
        supplier: supplier?.name || "",
        note: receiptNote || "Nhập theo phiếu"
      };
    });

    setProducts(newProducts);
    setHistory([...newHistoryItems, ...history]);
    
    alert("Đã lưu phiếu nhập kho thành công!");
    setStep(1);
    setSelectedSupplierId('');
    setReceiptItems([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-800 uppercase italic">Nhập kho sản phẩm</h1>
        <p className="text-sm text-gray-500 font-medium">Quản lý nhập hàng và lịch sử nhập kho</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Nhập kho */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            {step === 1 ? (
              /* BƯỚC 1: CHỌN NHÀ CUNG CẤP */
              <div className="space-y-6 py-8 px-4 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600 mb-4">
                  <PackagePlus size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-800 uppercase">Bắt đầu nhập hàng</h3>
                <div className="max-w-md mx-auto text-left">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Chọn nhà cung cấp</label>
                  <select 
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                    className="w-full p-4 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn nhà cung cấp --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <button 
                    onClick={handleStartReceipt}
                    className="w-full mt-4 bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                  >
                    Tạo phiếu nhập
                  </button>
                </div>
              </div>
            ) : (
              /* BƯỚC 2: NHẬP CHI TIẾT PHIẾU */
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Phiếu nhập kho</h3>
                    <p className="text-xs text-gray-500 font-medium">NCC: {suppliers.find(s => s.id === Number(selectedSupplierId))?.name}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                    <X size={20} />
                  </button>
                </div>

                {/* DANH SÁCH SẢN PHẨM TRONG PHIẾU */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 min-h-[100px]">
                  {receiptItems.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-4">Chưa có sản phẩm nào trong phiếu.</p>
                  ) : (
                    <div className="space-y-2">
                      {receiptItems.map((item, idx) => (
                        <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs font-bold text-gray-500">{idx + 1}</span>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{item.productName}</p>
                              <p className="text-xs text-gray-500">SL: {item.quantity} x {item.importPrice.toLocaleString()}đ</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-blue-600">{(item.quantity * item.importPrice).toLocaleString()}đ</span>
                            <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* FORM THÊM SẢN PHẨM */}
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-600 uppercase">Thêm sản phẩm vào phiếu</span>
                    <button 
                      onClick={() => navigate('/admin/products/add')}
                      className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> Tạo sản phẩm mới
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      {itemForm.isNew ? (
                        <input 
                          type="text" placeholder="Tên sản phẩm mới..."
                          value={itemForm.newProductName}
                          onChange={e => setItemForm({...itemForm, newProductName: e.target.value})}
                          className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500"
                        />
                      ) : (
                        <select 
                          value={itemForm.productId}
                          onChange={e => setItemForm({...itemForm, productId: e.target.value})}
                          className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500"
                        >
                          <option value="">-- Chọn sản phẩm --</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name} (Tồn: {p.stock})</option>)}
                        </select>
                      )}
                    </div>
                    <input 
                      type="number" placeholder="Số lượng" min="1"
                      value={itemForm.quantity}
                      onChange={e => setItemForm({...itemForm, quantity: Number(e.target.value)})}
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500"
                    />
                    <input 
                      type="number" placeholder="Giá nhập đơn vị" min="0"
                      value={itemForm.importPrice}
                      onChange={e => setItemForm({...itemForm, importPrice: Number(e.target.value)})}
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <button 
                    onClick={handleAddItem}
                    className="w-full py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-all"
                  >
                    + Thêm vào danh sách
                  </button>
                </div>

                {/* TỔNG KẾT & LƯU */}
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tổng tiền nhập (VNĐ)</label>
                    <input 
                      type="number" required min="0"
                      value={receiptTotal}
                      onChange={e => setReceiptTotal(Number(e.target.value))}
                      className="w-full p-3 rounded-xl border border-gray-200 text-lg font-black text-red-600 outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ghi chú phiếu nhập</label>
                    <textarea 
                      rows={2}
                      value={receiptNote}
                      onChange={e => setReceiptNote(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ví dụ: Nhập hàng đợt 1 tháng 10..."
                    />
                  </div>
                  <button onClick={handleSaveReceipt} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                    <Save size={18} /> Lưu phiếu nhập
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lịch sử nhập kho */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <History size={20} className="text-gray-500" /> Lịch sử nhập hàng gần đây
              </h3>
              <button className="text-xs font-bold text-blue-600 hover:underline">Xem tất cả</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Sản phẩm</th>
                    <th className="px-6 py-4 text-right">SL</th>
                    <th className="px-6 py-4 text-right">Tổng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-800">{item.product}</p>
                        <p className="text-[10px] text-gray-400">{item.date}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-green-600">+{item.quantity}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-700 text-right">{(item.importPrice * item.quantity)?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};