/**
 * Util đọc display settings.
 * Cache in-memory được nạp từ API lúc khởi động app (initDisplaySettings).
 * Fallback về default nếu API chưa khởi động hoặc lỗi.
 */
import { fetchDisplaySettings, DEFAULT_DISPLAY_SETTINGS, type DisplaySettings } from '../services/client/displaySettingsApi';

let cache: DisplaySettings = { ...DEFAULT_DISPLAY_SETTINGS };

/** Gọi một lần ở main.tsx trước khi render App */
export const initDisplaySettings = async (): Promise<void> => {
  try {
    cache = await fetchDisplaySettings();
  } catch {
    cache = { ...DEFAULT_DISPLAY_SETTINGS };
  }
};

/** Đọc một setting theo DB key (ví dụ: 'home_cols', 'promo_max_items') */
export const readDisplaySetting = (key: keyof DisplaySettings): number => {
  return cache[key] ?? DEFAULT_DISPLAY_SETTINGS[key];
};

/** Cập nhật cache ngay sau khi admin lưu (không cần reload trang) */
export const updateDisplayCache = (settings: Partial<DisplaySettings>): void => {
  cache = { ...cache, ...settings };
};

export type { DisplaySettings };
