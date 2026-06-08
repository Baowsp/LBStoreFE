import { Plus, Trash2 } from 'lucide-react';

export interface DescriptionItem {
  key: string;
  value: string;
}

interface Props {
  descriptionList: DescriptionItem[];
  setDescriptionList: (list: DescriptionItem[]) => void;
}

export const ProductDescriptionTable = ({ descriptionList, setDescriptionList }: Props) => {
  const addDesc = () => {
    setDescriptionList([...descriptionList, { key: '', value: '' }]);
  };

  const removeDesc = (index: number) => {
    setDescriptionList(descriptionList.filter((_, i) => i !== index));
  };

  const handleDescChange = (index: number, field: 'key' | 'value', value: string) => {
    const newList = [...descriptionList];
    newList[index][field] = value;
    setDescriptionList(newList);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-xs font-bold text-gray-500 uppercase">Mô tả sản phẩm</label>
        <button
          type="button"
          onClick={addDesc}
          className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1"
        >
          <Plus size={14} /> Thêm mô tả
        </button>
      </div>
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold">
            <tr>
              <th className="px-4 py-3 border-b border-gray-200 w-1/3">Tên mô tả</th>
              <th className="px-4 py-3 border-b border-gray-200">Thông tin / Giá trị</th>
              <th className="px-4 py-3 border-b border-gray-200 w-12 text-center">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {descriptionList.map((desc, index) => (
              <tr key={index}>
                <td className="p-2 border-r border-gray-100">
                  <input
                    type="text"
                    value={desc.key}
                    onChange={e => handleDescChange(index, 'key', e.target.value)}
                    placeholder="VD: Tính năng nổi bật"
                    className="w-full p-2 outline-none font-medium text-gray-700 bg-transparent"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={desc.value}
                    onChange={e => handleDescChange(index, 'value', e.target.value)}
                    placeholder="VD: Khung viền titan cao cấp..."
                    className="w-full p-2 outline-none text-gray-600 bg-transparent"
                  />
                </td>
                <td className="p-2 text-center border-l border-gray-100">
                  <button
                    type="button"
                    onClick={() => removeDesc(index)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {descriptionList.length === 0 && (
          <div className="p-4 text-center text-xs text-gray-400 italic bg-white">
            Chưa có thông tin mô tả nào
          </div>
        )}
      </div>
    </div>
  );
};
