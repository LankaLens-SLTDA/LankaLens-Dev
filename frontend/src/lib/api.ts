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

export interface CommentItem {
  id: number;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

export interface CommunityPost {
  id: number;
  author: string;
  role: string;
  avatar: string;
  time: string;
  verified: boolean;
  location: string;
  destination_id?: number;
  latitude?: number;
  longitude?: number;
  rating: number;
  image: string;
  caption: string;
  tags: string[];
  ecoPoints: number;
  likes_count: number;
  commentsCount: number;
  comments_count: number;
  saves_count: number;
  comments: CommentItem[];
  liked?: boolean;
  saved?: boolean;
}

export interface LeaderboardContributor {
  name: string;
  role: string;
  avatar: string;
  eco_points: number;
  verified_count: number;
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

export async function getCommunityPosts(params?: {
  sort_by?: 'latest' | 'trending' | 'top_eco';
  destination_id?: number;
  verified_only?: boolean;
  tag?: string;
}): Promise<CommunityPost[] | null> {
  const query = new URLSearchParams();
  if (params?.sort_by) query.append('sort_by', params.sort_by);
  if (params?.destination_id) query.append('destination_id', params.destination_id.toString());
  if (params?.verified_only) query.append('verified_only', 'true');
  if (params?.tag) query.append('tag', params.tag);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return fetchFromBackend<CommunityPost[]>(`/community/posts${queryString}`);
}

export async function interactWithCommunityPost(
  postId: number,
  payload: {
    action: 'like' | 'unlike' | 'save' | 'unsave' | 'comment';
    comment_text?: string;
    author_name?: string;
  }
): Promise<CommunityPost | null> {
  return fetchFromBackend<CommunityPost>(`/community/posts/${postId}/interact`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createCommunityPost(payload: {
  author?: string;
  role?: string;
  location: string;
  destination_id?: number;
  latitude?: number;
  longitude?: number;
  rating?: number;
  caption: string;
  tags?: string[];
  image?: string;
}): Promise<CommunityPost | null> {
  return fetchFromBackend<CommunityPost>('/community/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCommunityLeaderboard(): Promise<LeaderboardContributor[] | null> {
  return fetchFromBackend<LeaderboardContributor[]>('/community/leaderboard');
}
