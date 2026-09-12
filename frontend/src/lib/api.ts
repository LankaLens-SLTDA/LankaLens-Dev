const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface CrowdInfo {
  density: string;
  peak_hours: string;
  peak_months?: string[];
}

export interface CommunityStats {
  upvotes: number;
  save_count: number;
}

export interface PartnerInfo {
  name: string;
  type: string;
  contact: string;
  rating: number;
  verified: boolean;
}

export interface Destination {
  id: number;
  name: string;
  title: string;
  category: string;
  district: string;
  province: string;
  latitude: number;
  longitude: number;
  description: string;
  desc: string;
  activities: string[];
  estimated_visit_duration_minutes: number;
  baseline_cost: number;
  popularity: number;
  rating: number;
  reviews: number;
  trust_score: number;
  verification_state: string;
  publication_status: string;
  is_verified: boolean;
  crowd_info: CrowdInfo;
  partner_info?: PartnerInfo;
  community_stats: CommunityStats;
  nearby_attractions?: string[];
  images: string[];
  image_url: string;
  image: string;
  coord_x: string;
  coord_y: string;
  coords: { x: string; y: string };
  elevation: string;
  distance_from_colombo: string;
  distance: string;
  distance_km?: number;
}

export interface DestinationListResponse {
  destinations: Destination[];
  total: number;
}

export interface DestinationResponse {
  destination: Destination;
  message: string;
}

export async function fetchFromBackend<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
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
    console.warn(
      `[LankaLens API] Backend fetch failed for ${endpoint}, using client fallback:`,
      err
    );
    return null;
  }
}

export async function getDestinations(params?: {
  category?: string;
  district?: string;
  province?: string;
  verification_state?: string;
  verified_only?: boolean;
  q?: string;
}): Promise<DestinationListResponse | null> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.district) query.append('district', params.district);
  if (params?.province) query.append('province', params.province);
  if (params?.verification_state) query.append('verification_state', params.verification_state);
  if (params?.verified_only) query.append('verified_only', 'true');
  if (params?.q) query.append('q', params.q);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return fetchFromBackend<DestinationListResponse>(`/destinations${queryString}`);
}

export async function getNearbyDestinations(
  lat: number,
  lng: number,
  radiusKm = 50.0
): Promise<DestinationListResponse | null> {
  return fetchFromBackend<DestinationListResponse>(
    `/destinations/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`
  );
}

export async function getDestinationById(id: number): Promise<DestinationResponse | null> {
  return fetchFromBackend<DestinationResponse>(`/destinations/${id}`);
}
