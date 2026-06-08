import { API_BASE_URL, fetchWithAuth } from '../core/apiClient';

export interface DisplaySettings {
  home_cols:          number;
  home_rows:          number;
  search_cols:        number;
  search_rows:        number;
  promo_cols:         number;
  promo_rows:         number;
  promoted_page_cols: number;
  promoted_page_rows: number;
}

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  home_cols:          4,
  home_rows:          2,
  search_cols:        5,
  search_rows:        4,
  promo_cols:         5,
  promo_rows:         2,
  promoted_page_cols: 5,
  promoted_page_rows: 4,
};

/** GET /api/settings/display — public, không cần auth */
export const fetchDisplaySettings = async (): Promise<DisplaySettings> => {
  try {
    const res = await fetch(`${API_BASE_URL}/settings/display`);
    if (!res.ok) throw new Error('Failed to fetch display settings');
    return await res.json() as DisplaySettings;
  } catch {
    return { ...DEFAULT_DISPLAY_SETTINGS };
  }
};

/** PUT /api/settings/display — cần admin auth */
export const saveDisplaySettings = async (settings: Partial<DisplaySettings>): Promise<DisplaySettings> => {
  const res = await fetchWithAuth(`${API_BASE_URL}/settings/display`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to save display settings');
  return await res.json() as DisplaySettings;
};
