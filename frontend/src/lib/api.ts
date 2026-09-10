const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function fetchFromBackend<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`Backend response error: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[LankaLens API] Backend fetch failed for ${endpoint}, using client fallback:`, err);
    return null;
  }
}
