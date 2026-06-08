import { ADMIN_API_BASE_URL, fetchAdminWithAuth, handleAdminResponse, getCleanImageUrlAdmin } from '../core/adminClient';

export const adminFetchProducts = (page = 0, size = 10, search = '') => {
  const sort = 'id,desc';
  const url = search 
    ? `${ADMIN_API_BASE_URL}/products/search?q=${encodeURIComponent(search)}&page=${page}&size=${size}&sort=${sort}`
    : `${ADMIN_API_BASE_URL}/products?page=${page}&size=${size}&sort=${sort}`;
  return fetchAdminWithAuth(url)
    .then(r => handleAdminResponse<any>(r))
    .then(d => {
      const cleanProduct = (p: any) => ({
        ...p,
        imageURL: getCleanImageUrlAdmin(p.imageURL),
        image_url: getCleanImageUrlAdmin(p.image_url),
        variants: (p.variants ?? []).map((v: any) => ({
          ...v,
          thumbnailUrl: getCleanImageUrlAdmin(v.thumbnailUrl),
          variantColors: (v.variantColors ?? []).map((vc: any) => ({
            ...vc,
            imageUrl: getCleanImageUrlAdmin(vc.imageUrl)
          }))
        }))
      });
      return {
        content: (d.content ?? []).map(cleanProduct),
        totalElements: d.totalElements ?? 0,
        totalPages: d.totalPages ?? 1
      };
    });
};

export const adminFetchProduct = (id: number) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/products/${id}`)
    .then(r => handleAdminResponse<any>(r))
    .then(p => ({
      ...p,
      imageURL: getCleanImageUrlAdmin(p.imageURL),
      image_url: getCleanImageUrlAdmin(p.image_url),
      variants: (p.variants ?? []).map((v: any) => ({
        ...v,
        thumbnailUrl: getCleanImageUrlAdmin(v.thumbnailUrl),
        variantColors: (v.variantColors ?? []).map((vc: any) => ({
          ...vc,
          imageUrl: getCleanImageUrlAdmin(vc.imageUrl)
        }))
      }))
    }));

export const adminCreateProduct = (data: any) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/products`, {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(r => handleAdminResponse<any>(r));

export const adminUpdateProduct = (id: number, data: any) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then(r => handleAdminResponse<any>(r));

export const adminDeleteProduct = (id: number) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/products/${id}`, { method: 'DELETE' })
    .then(r => handleAdminResponse<void>(r));

export const adminUploadFile = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/v1/files/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errorText = 'Upload failed';
    try {
      const errRes = await res.json();
      errorText = errRes.message || errRes.error || JSON.stringify(errRes);
    } catch (e) {
      errorText = await res.text();
    }
    throw new Error(`Server (500): ${errorText}`);
  }
  const data = await res.json();
  return {
    ...data,
    url: getCleanImageUrlAdmin(data.url)
  };
};
