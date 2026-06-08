interface Props {
  cols: number;
  setCols: (cols: number) => void;
  rows: number;
  setRows: (rows: number) => void;
  onColsChange?: (cols: number) => void;
  onRowsChange?: (rows: number) => void;
}

/**
 * Bộ điều khiển số cột/hàng hiển thị sản phẩm.
 * Props `onColsChange` và `onRowsChange` (tuỳ chọn) dùng khi cần side-effect (vd: update URL).
 */
export const DisplayControls = ({ cols, setCols, rows, setRows, onColsChange, onRowsChange }: Props) => {
  return (
    <div className="flex items-center gap-6 mb-6 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100">
      <span className="text-sm font-semibold text-gray-600">Hiển thị:</span>
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">Cột </label>
        <input
          type="number"
          min="2"
          max="6"
          value={cols}
          onChange={e => {
            const n = Math.max(2, Math.min(6, parseInt(e.target.value) || 2));
            setCols(n);
            onColsChange?.(n);
          }}
          className="w-16 h-8 px-2 rounded-lg text-sm font-bold border border-gray-200 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-gray-50 transition-all"
        />
      </div>
      <div className="w-px h-6 bg-gray-200" />
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">Hàng </label>
        <input
          type="number"
          min="1"
          max="10"
          value={rows}
          onChange={e => {
            const n = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
            setRows(n);
            onRowsChange?.(n);
          }}
          className="w-16 h-8 px-2 rounded-lg text-sm font-bold border border-gray-200 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-gray-50 transition-all"
        />
      </div>
    </div>
  );
};
