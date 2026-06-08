import { useState, useEffect } from 'react';
import { Settings, LayoutGrid, Search, Tag, Save, RotateCcw, Monitor, Loader2 } from 'lucide-react';
import { fetchDisplaySettings, saveDisplaySettings, DEFAULT_DISPLAY_SETTINGS, type DisplaySettings } from '../../services/client/displaySettingsApi';
import { updateDisplayCache } from '../../utils/displaySettings';

// ─── Reusable number input ───────────────────────────────────────────────────
interface NumInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  unit?: string;
}
const NumInput = ({ label, value, min, max, onChange, unit }: NumInputProps) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <span className="text-sm font-semibold text-gray-700">{label}</span>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-600 font-black text-lg flex items-center justify-center transition-colors"
      >−</button>
      <span className="w-8 text-center text-sm font-black text-gray-800">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-600 font-black text-lg flex items-center justify-center transition-colors"
      >+</button>
      {unit && <span className="text-xs text-gray-400 w-16">{unit}</span>}
    </div>
  </div>
);

// ─── Section card ────────────────────────────────────────────────────────────
const SectionCard = ({
  icon, title, color, children,
}: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
    <div className={`${color} px-6 py-4 flex items-center gap-3`}>
      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white">
        {icon}
      </div>
      <h2 className="text-white font-black text-sm uppercase italic tracking-wide">{title}</h2>
    </div>
    <div className="px-6 py-2">{children}</div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const AdminSettings = () => {
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [saved,   setSaved]     = useState(false);
  const [error,   setError]     = useState('');

  const [settings, setSettings] = useState<DisplaySettings>({ ...DEFAULT_DISPLAY_SETTINGS });

  // Load từ API khi mở trang
  useEffect(() => {
    fetchDisplaySettings()
      .then(s => setSettings(s))
      .catch(() => setSettings({ ...DEFAULT_DISPLAY_SETTINGS }))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof DisplaySettings) => (val: number) =>
    setSettings(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await saveDisplaySettings(settings);
      setSettings(updated);
      updateDisplayCache(updated); // cập nhật cache in-memory ngay
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Không thể lưu. Kiểm tra lại kết nối server.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => setSettings({ ...DEFAULT_DISPLAY_SETTINGS });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
          <Settings size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-800">Cài đặt hiển thị</h1>
          <p className="text-gray-400 text-xs mt-0.5">Tùy chỉnh lưới sản phẩm — lưu vào CSDL</p>
        </div>
      </div>

      {/* Trang chủ */}
      <SectionCard icon={<Monitor size={18} />} title="Trang chủ — Danh mục sản phẩm" color="bg-gradient-to-r from-blue-600 to-indigo-600">
        <NumInput label="Số cột hiển thị"  value={settings.home_cols} min={2} max={6} onChange={set('home_cols')} unit="cột" />
        <NumInput label="Số hàng hiển thị" value={settings.home_rows} min={1} max={8} onChange={set('home_rows')} unit="hàng" />
        <div className="py-3">
          <p className="text-xs text-gray-400">⚡ Tối đa <strong className="text-gray-600">{settings.home_cols * settings.home_rows}</strong> sản phẩm / danh mục.</p>
        </div>
      </SectionCard>

      {/* Tìm kiếm */}
      <SectionCard icon={<Search size={18} />} title="Trang tìm kiếm" color="bg-gradient-to-r from-violet-600 to-purple-600">
        <NumInput label="Số cột hiển thị"  value={settings.search_cols} min={2} max={6} onChange={set('search_cols')} unit="cột" />
        <NumInput label="Số hàng / trang"  value={settings.search_rows} min={1} max={10} onChange={set('search_rows')} unit="hàng" />
        <div className="py-3">
          <p className="text-xs text-gray-400">⚡ Tối đa <strong className="text-gray-600">{settings.search_cols * settings.search_rows}</strong> sản phẩm / trang.</p>
        </div>
      </SectionCard>

      {/* Khuyến mãi (Trang chủ) */}
      <SectionCard icon={<Tag size={18} />} title="Section khuyến mãi — Trang chủ" color="bg-gradient-to-r from-red-600 to-orange-500">
        <NumInput label="Số cột sản phẩm"  value={settings.promo_cols} min={2} max={6} onChange={set('promo_cols')} unit="cột" />
        <NumInput label="Số hàng sản phẩm" value={settings.promo_rows} min={1} max={10} onChange={set('promo_rows')} unit="hàng" />
        <div className="py-3">
          <p className="text-xs text-gray-400">⚡ Mỗi chương trình khuyến mãi trên trang chủ hiển thị tối đa <strong className="text-gray-600">{settings.promo_cols * settings.promo_rows}</strong> sản phẩm.</p>
        </div>
      </SectionCard>

      {/* Trang chi tiết khuyến mãi */}
      <SectionCard icon={<Tag size={18} />} title="Trang chi tiết khuyến mãi" color="bg-gradient-to-r from-pink-600 to-rose-500">
        <NumInput label="Số cột hiển thị"  value={settings.promoted_page_cols} min={2} max={6} onChange={set('promoted_page_cols')} unit="cột" />
        <NumInput label="Số hàng / trang"  value={settings.promoted_page_rows} min={1} max={10} onChange={set('promoted_page_rows')} unit="hàng" />
        <div className="py-3">
          <p className="text-xs text-gray-400">⚡ Mỗi trang chi tiết khuyến mãi hiển thị tối đa <strong className="text-gray-600">{settings.promoted_page_cols * settings.promoted_page_rows}</strong> sản phẩm.</p>
        </div>
      </SectionCard>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <p className="text-red-600 text-sm font-semibold">❌ {error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-red-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? '✅ Đã lưu vào CSDL!' : saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-5 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition-all text-sm"
        >
          <RotateCcw size={14} /> Đặt lại mặc định
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-blue-700 text-sm font-semibold flex items-start gap-2">
          <LayoutGrid size={16} className="flex-shrink-0 mt-0.5" />
          Cài đặt được lưu vào bảng <code className="bg-blue-100 px-1 rounded text-xs">display_settings</code> trong CSDL.
          Áp dụng ngay cho tất cả người dùng sau khi họ tải lại trang.
        </p>
      </div>
    </div>
  );
};
