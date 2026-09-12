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

export interface ExifMetadata {
  camera: string;
  lens: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  width: number;
  height: number;
  has_gps: boolean;
}

export interface AiValidationResult {
  passed: boolean;
  confidence_score: number;
  boundary_check: string;
  quality_check: string;
  text_safety_check: string;
  wcag_alt_check: string;
  notes: string;
}

export interface AiTrustAudit {
  overall_trust_score: number;
  geo_consistency_score: number;
  distance_to_destination_km?: number | null;
  image_authenticity_score: number;
  is_synthetic_image: boolean;
  text_safety_score: number;
  spam_risk_score: number;
  duplicate_risk_score: number;
  ai_fallback_triggered: boolean;
  flags: string[];
  summary_notes: string;
}

export interface ContributionPayload {
  author_name?: string;
  title: string;
  category?: string;
  destination_id?: number;
  description: string;
  alt_text: string;
  tags?: string[];
  rating?: number;
  latitude?: number;
  longitude?: number;
  image_url?: string;
}

export interface ContributionRecord {
  id: number;
  author_name: string;
  title: string;
  category: string;
  destination_id?: number;
  description: string;
  image_url: string;
  alt_text: string;
  tags: string[];
  rating: number;
  latitude?: number;
  longitude?: number;
  exif_metadata: ExifMetadata;
  ai_validation_result: AiValidationResult;
  ai_trust_audit?: AiTrustAudit;
  ai_confidence_score: number;
  status: string;
  moderation_status: string;
  reputation_points_awarded: number;
  created_at: string;
}

export interface ModerationQueueResponse {
  queue: ContributionRecord[];
  total_pending: number;
  flagged_count: number;
  average_trust_score: number;
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

export async function extractPhotoMetadata(
  filename?: string,
  lat?: number,
  lng?: number
): Promise<ExifMetadata | null> {
  const query = new URLSearchParams();
  if (filename) query.append('filename', filename);
  if (lat !== undefined) query.append('lat', lat.toString());
  if (lng !== undefined) query.append('lng', lng.toString());
  const qStr = query.toString() ? `?${query.toString()}` : '';

  return fetchFromBackend<ExifMetadata>(`/contribution/extract-metadata${qStr}`, {
    method: 'POST',
  });
}

export async function submitContribution(
  payload: ContributionPayload
): Promise<ContributionRecord | null> {
  return fetchFromBackend<ContributionRecord>('/contribution/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function reportContent(payload: {
  target_type: 'contribution' | 'post' | 'comment';
  target_id: number;
  reason: 'spam' | 'inaccurate_gps' | 'inappropriate' | 'copyright';
  description?: string;
}): Promise<{ id: number; message: string } | null> {
  return fetchFromBackend<{ id: number; message: string }>('/contribution/report', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getModerationQueue(
  flagFilter?: string
): Promise<ModerationQueueResponse | null> {
  const query = new URLSearchParams();
  if (flagFilter) query.append('flag_filter', flagFilter);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  return fetchFromBackend<ModerationQueueResponse>(`/contribution/moderation-queue${qStr}`);
}

export async function moderateContribution(
  id: number,
  payload: {
    action: 'approve' | 'reject';
    moderator_name?: string;
    feedback?: string;
    rejection_category?: string;
  }
): Promise<ContributionRecord | null> {
  return fetchFromBackend<ContributionRecord>(`/contribution/${id}/moderate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at?: string;
}

export interface UserReputationProfile {
  author_name: string;
  rank: 'New Contributor' | 'Verified Local' | 'Trusted Guide' | string;
  eco_points: number;
  reputation_score: number;
  ai_pass_rate: number;
  approved_count: number;
  rejected_count: number;
  total_submissions: number;
  total_likes_received: number;
  total_comments_received: number;
  badges: Badge[];
  is_guide_eligible: boolean;
  guide_upgrade_status: 'none' | 'eligible' | 'applied' | 'certified' | string;
  daily_points_accrued: number;
}

export interface GuideApplicationPayload {
  author_name: string;
  contact_number: string;
  sltda_license_number?: string;
  niche_specialization: string;
  bio_summary: string;
  portfolio_links?: string[];
}

export interface GuideApplicationResponse {
  application_id: number;
  status: string;
  message: string;
}

export async function getUserReputationProfile(
  authorName: string
): Promise<UserReputationProfile | null> {
  const encodedName = encodeURIComponent(authorName);
  return fetchFromBackend<UserReputationProfile>(`/reputation/profile/${encodedName}`);
}

export async function getReputationLeaderboard(): Promise<UserReputationProfile[] | null> {
  return fetchFromBackend<UserReputationProfile[]>('/reputation/leaderboard');
}

export async function submitGuideApplication(
  payload: GuideApplicationPayload
): Promise<GuideApplicationResponse | null> {
  return fetchFromBackend<GuideApplicationResponse>('/reputation/guide-upgrade', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface SearchQueryResponse {
  destinations: Destination[];
  total: number;
  page: number;
  limit: number;
  cached: boolean;
  query_time_ms: number;
}

export async function searchDestinations(params?: {
  q?: string;
  activity?: string;
  category?: string;
  district?: string;
  province?: string;
  crowd_level?: string;
  max_cost?: number;
  min_cost?: number;
  min_rating?: number;
  lat?: number;
  lng?: number;
  radius_km?: number;
  limit?: number;
  offset?: number;
}): Promise<SearchQueryResponse | null> {
  const query = new URLSearchParams();
  if (params?.q) query.append('q', params.q);
  if (params?.activity) query.append('activity', params.activity);
  if (params?.category) query.append('category', params.category);
  if (params?.district) query.append('district', params.district);
  if (params?.province) query.append('province', params.province);
  if (params?.crowd_level) query.append('crowd_level', params.crowd_level);
  if (params?.max_cost !== undefined) query.append('max_cost', params.max_cost.toString());
  if (params?.min_cost !== undefined) query.append('min_cost', params.min_cost.toString());
  if (params?.min_rating !== undefined) query.append('min_rating', params.min_rating.toString());
  if (params?.lat !== undefined) query.append('lat', params.lat.toString());
  if (params?.lng !== undefined) query.append('lng', params.lng.toString());
  if (params?.radius_km !== undefined) query.append('radius_km', params.radius_km.toString());
  if (params?.limit !== undefined) query.append('limit', params.limit.toString());
  if (params?.offset !== undefined) query.append('offset', params.offset.toString());

  const qStr = query.toString() ? `?${query.toString()}` : '';
  return fetchFromBackend<SearchQueryResponse>(`/destinations/search${qStr}`);
}

export interface MapCluster {
  cluster_id: string;
  latitude: number;
  longitude: number;
  point_count: number;
  category_distribution: Record<string, number>;
  destination_ids: number[];
}

export interface PartnerLocation {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  rating: number;
  contact: string;
  verified: boolean;
  associated_destination_id?: number | null;
}

export interface MapDiscoveryResponse {
  destinations: Destination[];
  clusters: MapCluster[];
  total_in_viewport: number;
  recommended_alternatives: Destination[];
  partner_locations: PartnerLocation[];
  viewport_bounds: {
    min_lat: number;
    min_lng: number;
    max_lat: number;
    max_lng: number;
  };
  query_time_ms: number;
}

export async function getMapViewportDiscovery(params?: {
  min_lat?: number;
  min_lng?: number;
  max_lat?: number;
  max_lng?: number;
  zoom?: number;
  selected_dest_id?: number;
  include_partners?: boolean;
}): Promise<MapDiscoveryResponse | null> {
  const query = new URLSearchParams();
  if (params?.min_lat !== undefined) query.append('min_lat', params.min_lat.toString());
  if (params?.min_lng !== undefined) query.append('min_lng', params.min_lng.toString());
  if (params?.max_lat !== undefined) query.append('max_lat', params.max_lat.toString());
  if (params?.max_lng !== undefined) query.append('max_lng', params.max_lng.toString());
  if (params?.zoom !== undefined) query.append('zoom', params.zoom.toString());
  if (params?.selected_dest_id !== undefined)
    query.append('selected_dest_id', params.selected_dest_id.toString());
  if (params?.include_partners !== undefined)
    query.append('include_partners', params.include_partners ? 'true' : 'false');

  const qStr = query.toString() ? `?${query.toString()}` : '';
  return fetchFromBackend<MapDiscoveryResponse>(`/destinations/viewport${qStr}`);
}

export async function getDestinationAlternatives(
  id: number,
  limit = 3
): Promise<DestinationListResponse | null> {
  return fetchFromBackend<DestinationListResponse>(
    `/destinations/${id}/alternatives?limit=${limit}`
  );
}

export async function getDestinationPartners(id: number): Promise<PartnerLocation[] | null> {
  return fetchFromBackend<PartnerLocation[]>(`/destinations/${id}/partners`);
}

export interface MarketplaceService {
  id: number;
  name: string;
  category: 'hotel' | 'vehicle' | 'guide' | string;
  rating: number;
  price_range: string;
  contact: string;
  image: string;
  verified: boolean;
  location_note: string;
}

export interface BudgetBreakdown {
  entry_fee: number;
  avg_meal_cost: number;
  local_transport_cost: number;
  guide_fee_optional: number;
  total_estimated_day_budget: number;
}

export interface DestinationDetailsResponse {
  destination: Destination;
  community_posts: CommunityPost[];
  trust_metrics: {
    overall_trust_score: number;
    geo_consistency_score: number;
    image_authenticity_score: number;
    verification_badge: string;
    spam_risk_score: number;
    flags: string[];
    summary_notes: string;
  };
  hotels: MarketplaceService[];
  vehicles: MarketplaceService[];
  guides: MarketplaceService[];
  nearby_alternatives: Destination[];
  crowd_status: CrowdInfo;
  budget_breakdown: BudgetBreakdown;
  query_time_ms: number;
}

export async function getDestinationDetails(
  id: number
): Promise<DestinationDetailsResponse | null> {
  return fetchFromBackend<DestinationDetailsResponse>(`/destinations/${id}/details`);
}

export interface UserRecommendationRequest {
  interests?: string[];
  travel_style?: string;
  max_budget_per_day?: number;
  group_size?: number;
  trip_duration_days?: number;
  lat?: number;
  lng?: number;
  crowd_tolerance?: 'low' | 'medium' | 'high' | string;
  preferred_activities?: string[];
  limit?: number;
}

export interface ScoreBreakdown {
  interest_score: number;
  budget_score: number;
  crowd_score: number;
  trust_score: number;
  distance_score: number;
  rating_score: number;
  total_score: number;
}

export interface RecommendationExplanation {
  match_percentage: number;
  score_breakdown: ScoreBreakdown;
  reasons: string[];
}

export interface RecommendedDestination {
  destination: Destination;
  match_percentage: number;
  explanation: RecommendationExplanation;
}

export interface RecommendationResponse {
  recommendations: RecommendedDestination[];
  total: number;
  query_params: UserRecommendationRequest;
  engine_metadata: {
    model_name: string;
    version: string;
    supports_ml_pipeline: boolean;
    ranking_weights: Record<string, number>;
  };
  query_time_ms: number;
}

export async function getPersonalizedRecommendations(
  payload: UserRecommendationRequest
): Promise<RecommendationResponse | null> {
  return fetchFromBackend<RecommendationResponse>('/recommendations/personalized', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface CostCategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  description: string;
}

export interface BudgetCalculationRequest {
  travellers_count?: number;
  duration_days?: number;
  accommodation_style?: string;
  transport_mode?: string;
  food_preference?: string;
  activity_level?: string;
  destination_ids?: number[];
  currency?: string;
}

export interface BudgetCalculationResponse {
  total_budget: number;
  per_person_budget: number;
  per_day_budget: number;
  currency: string;
  breakdown: CostCategoryBreakdown[];
  travel_style_tier: string;
  calculation_model: string;
  savings_tips: string[];
  query_time_ms: number;
}

export interface BudgetRecommendationRequest {
  max_budget: number;
  travellers_count?: number;
  duration_days?: number;
  interests?: string[];
}

export interface BudgetRecommendationResponse {
  recommended_destinations: Destination[];
  estimated_trip_cost: number;
  budget_fit_status: string;
  budget_utilization_pct: number;
}

export async function calculateTripBudget(
  payload: BudgetCalculationRequest
): Promise<BudgetCalculationResponse | null> {
  return fetchFromBackend<BudgetCalculationResponse>('/planner/calculate-budget', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getBudgetRecommendations(
  payload: BudgetRecommendationRequest
): Promise<BudgetRecommendationResponse | null> {
  return fetchFromBackend<BudgetRecommendationResponse>('/planner/budget-recommendations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface TripStopItem {
  id: number;
  destination_id: number;
  name: string;
  title: string;
  category: string;
  district: string;
  scheduled_time: string;
  estimated_duration: string;
  visit_cost: number;
  image: string;
  latitude: number;
  longitude: number;
  notes?: string;
}

export interface TripDayPlan {
  day_number: number;
  title: string;
  date: string;
  stops: TripStopItem[];
  estimated_travel_time: string;
  estimated_travel_distance_km: number;
  day_cost: number;
}

export interface TripCreatePayload {
  title?: string;
  start_date?: string;
  duration_days?: number;
  group_size?: number;
  total_budget?: number;
  starting_location?: string;
  destination_ids?: number[];
  interests?: string[];
}

export interface TripRecord {
  id: number;
  title: string;
  start_date: string;
  duration_days: number;
  group_size: number;
  total_budget: number;
  starting_location: string;
  days: TripDayPlan[];
  total_calculated_cost: number;
  per_person_cost: number;
  total_travel_distance_km: number;
  budget_fit_status: string;
  share_token: string;
  created_at: string;
  updated_at: string;
}

export interface TripExportResponse {
  share_token: string;
  share_url: string;
  trip: TripRecord;
}

export async function createTrip(payload: TripCreatePayload): Promise<TripRecord | null> {
  return fetchFromBackend<TripRecord>('/planner/trips', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getUserTrips(): Promise<TripRecord[] | null> {
  return fetchFromBackend<TripRecord[]>('/planner/trips');
}

export async function getTripById(id: number): Promise<TripRecord | null> {
  return fetchFromBackend<TripRecord>(`/planner/trips/${id}`);
}

export async function updateTrip(
  id: number,
  payload: Partial<TripCreatePayload> & { days?: TripDayPlan[] }
): Promise<TripRecord | null> {
  return fetchFromBackend<TripRecord>(`/planner/trips/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function addDestinationToTrip(
  id: number,
  payload: { destination_id: number; target_day?: number; scheduled_time?: string; notes?: string }
): Promise<TripRecord | null> {
  return fetchFromBackend<TripRecord>(`/planner/trips/${id}/add-destination`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function removeDestinationFromTrip(
  id: number,
  destId: number,
  dayNumber?: number
): Promise<TripRecord | null> {
  const query = dayNumber ? `?day_number=${dayNumber}` : '';
  return fetchFromBackend<TripRecord>(`/planner/trips/${id}/destinations/${destId}${query}`, {
    method: 'DELETE',
  });
}

export async function suggestTripItinerary(payload: TripCreatePayload): Promise<TripRecord | null> {
  return fetchFromBackend<TripRecord>('/planner/trips/suggest', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function exportTrip(id: number): Promise<TripExportResponse | null> {
  return fetchFromBackend<TripExportResponse>(`/planner/trips/${id}/export`);
}
