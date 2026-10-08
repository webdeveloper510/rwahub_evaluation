import { API_BASE_URL } from '@/utils/apiBase';

export function normalizeAsset(raw: any) {
  const priceAmount = Number(raw?.price?.amount ?? raw?.value ?? 0);
  return {
    ...raw,
    imageUrl: raw?.imageUrl || raw?.images?.[0] || '',
    value: Number.isFinite(Number(raw?.value)) ? Number(raw.value) : priceAmount,
    views: raw?.views ?? 0,
    likes: raw?.likes ?? 0,
    tokenId: raw?.tokenId || raw?.id || '',
    createdAt: raw?.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw?.updatedAt ? new Date(raw.updatedAt) : new Date(),
    price: {
      amount: Number.isFinite(priceAmount) ? priceAmount : 0,
      currency: raw?.price?.currency || 'USDT',
    },
  };
}

export async function fetchAssetsFromApi(params?: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  query.set('limit', String(params?.limit ?? 100));
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && key !== 'limit') {
      query.set(key, String(value));
    }
  });
  const response = await fetch(`${API_BASE_URL}/assets?${query.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch assets');
  }
  const data = await response.json();
  const assets = Array.isArray(data?.assets) ? data.assets : Array.isArray(data) ? data : [];
  return assets.map(normalizeAsset);
}

export async function fetchAssetByIdFromApi(id: string) {
  const response = await fetch(`${API_BASE_URL}/assets/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch asset');
  }
  return normalizeAsset(await response.json());
}

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/9978722/pexels-photo-9978722.jpeg';

export function isStoredImageUrl(url: unknown): url is string {
  return typeof url === 'string' && (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:image/') ||
    url.startsWith('/')
  );
}

export async function createAssetOnApi(asset: any) {
  const description = String(asset.description || '');
  const imageUrl = isStoredImageUrl(asset.imageUrl) ? asset.imageUrl : FALLBACK_IMAGE;
  const images = Array.isArray(asset.images)
    ? asset.images.filter(isStoredImageUrl)
    : [];
  const payload = {
    title: asset.title,
    description: description.length >= 10 ? description : `${description} tokenized asset`.trim(),
    category: asset.category || 'other',
    price: asset.price,
    tokenization: asset.tokenization,
    listingType: asset.listingType || 'fixed',
    imageUrl,
    images: images.length ? images : [imageUrl],
    owner: asset.owner,
    status: asset.status,
    isVerified: asset.isVerified,
    tokenId: asset.tokenId,
    value: asset.value ?? asset.price?.amount,
  };

  const response = await fetch(`${API_BASE_URL}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Failed to create asset');
  }
  return normalizeAsset(await response.json());
}
