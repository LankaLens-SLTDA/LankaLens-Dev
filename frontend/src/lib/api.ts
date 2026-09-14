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

export interface CrowdStatusInfo {
  destination_id: number;
  destination_name: string;
  crowd_score: number;
  crowd_status: string;
  is_overcrowded: boolean;
  current_capacity_pct: number;
  peak_hours: string;
  warning_message?: string | null;
}

export interface AlternativeDestinationSuggestion {
  destination_id: number;
  name: string;
  category: string;
  district: string;
  crowd_status: string;
  crowd_reduction_pct: number;
  distance_km: number;
  rating: number;
  image_url: string;
  recommendation_reason: string;
}

export interface DensityPoint {
  hour: string;
  density: number;
}

export interface VisitorLoadCurveResponse {
  destination_id: number;
  destination_name: string;
  hourly_curve: DensityPoint[];
  peak_hour: string;
  recommended_offpeak_hours: string[];
}

export interface EnvironmentalReportRecord {
  id: number;
  location: string;
  description: string;
  reporter_name: string;
  status: string;
  reward_points_awarded: number;
  created_at: string;
}

export async function getCrowdStatus(destinationId: number): Promise<CrowdStatusInfo | null> {
  return fetchFromBackend<CrowdStatusInfo>(`/sustainability/crowd-status/${destinationId}`);
}

export async function getCrowdAlternatives(
  destinationId: number,
  limit = 3
): Promise<AlternativeDestinationSuggestion[] | null> {
  return fetchFromBackend<AlternativeDestinationSuggestion[]>(
    `/sustainability/alternatives/${destinationId}?limit=${limit}`
  );
}

export async function getVisitorLoadCurve(
  destinationId: number
): Promise<VisitorLoadCurveResponse | null> {
  return fetchFromBackend<VisitorLoadCurveResponse>(
    `/sustainability/visitor-load/${destinationId}`
  );
}

export async function submitHazardReport(payload: {
  location: string;
  description: string;
  reporter_name?: string;
}): Promise<{ status: string; message: string; rewardPoints: number } | null> {
  return fetchFromBackend<{ status: string; message: string; rewardPoints: number }>(
    '/sustainability/report',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function getHazardReports(): Promise<EnvironmentalReportRecord[] | null> {
  return fetchFromBackend<EnvironmentalReportRecord[]>('/sustainability/reports');
}

export interface AlternativeMatchSubScores {
  proximity_score: number;
  category_similarity_score: number;
  activity_overlap_score: number;
  budget_fit_score: number;
  crowd_advantage_score: number;
  trust_score: number;
  rating_score: number;
  travel_time_score: number;
}

export interface AlternativeMatchExplanation {
  overall_match_score: number;
  match_percentage: number;
  crowd_reduction_pct: number;
  estimated_drive_time_minutes: number;
  drive_time_formatted: string;
  distance_km: number;
  sub_scores: AlternativeMatchSubScores;
  key_reasons: string[];
}

export interface AlternativeMatchResult {
  original_destination_id: number;
  original_destination_name: string;
  original_crowd_status: string;
  alternative_destination: Destination;
  explanation: AlternativeMatchExplanation;
}

export interface AlternativeMatchRequest {
  destination_id: number;
  max_distance_km?: number;
  max_budget?: number;
  preferred_categories?: string[];
  min_rating?: number;
  min_trust_score?: number;
  max_crowd_level?: string;
  limit?: number;
}

export interface AlternativeMatchResponse {
  original_destination: Destination;
  alternatives: AlternativeMatchResult[];
  total_found: number;
  query_time_ms: number;
}

export interface FeatureDifference {
  attribute: string;
  original_value: string;
  alternative_value: string;
  advantage: 'alternative' | 'original' | 'neutral' | string;
  note: string;
}

export interface SideBySideComparisonResponse {
  original_destination: Destination;
  alternative_destination: Destination;
  explanation: AlternativeMatchExplanation;
  feature_differences: FeatureDifference[];
  recommendation_summary: string;
}

export async function getAlternativeMatches(
  payload: AlternativeMatchRequest
): Promise<AlternativeMatchResponse | null> {
  return fetchFromBackend<AlternativeMatchResponse>('/alternatives/match', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAlternativeDestinationList(
  destinationId: number,
  limit = 5,
  maxDistanceKm = 120.0
): Promise<AlternativeMatchResponse | null> {
  return fetchFromBackend<AlternativeMatchResponse>(
    `/alternatives/destination/${destinationId}?limit=${limit}&max_distance_km=${maxDistanceKm}`
  );
}

export async function compareAlternatives(
  originalId: number,
  alternativeId: number
): Promise<SideBySideComparisonResponse | null> {
  return fetchFromBackend<SideBySideComparisonResponse>(
    `/alternatives/compare/${originalId}/${alternativeId}`
  );
}

export interface GroundingEntity {
  id: number;
  name: string;
  category: string;
  verified_cost: number;
  trust_score: number;
  crowd_status: string;
}

export interface GroundingMetadata {
  is_grounded: boolean;
  entities_found: GroundingEntity[];
  hallucination_check_passed: boolean;
  retrieval_confidence: number;
  sources_used: string[];
}

export interface AIChatCardData {
  id: number;
  title: string;
  type: string;
  desc: string;
  image: string;
  duration: string;
  cost: number;
  rating: number;
  crowd_status: string;
}

export interface AIChatRequest {
  message: string;
  language?: string;
  context?: Record<string, unknown>;
}

export interface AIChatResponse {
  reply: string;
  hasCard: boolean;
  cardData?: AIChatCardData | null;
  followUps: string[];
  detected_intent: string;
  language: string;
  grounding_metadata: GroundingMetadata;
}

export async function queryAIAssistant(payload: AIChatRequest): Promise<AIChatResponse | null> {
  return fetchFromBackend<AIChatResponse>('/ai-assistant/query', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function validateAIGrounding(payload: {
  generated_text: string;
  mentioned_destination_ids?: number[];
}): Promise<{ passed: boolean; corrected_text: string; hallucinations_detected: string[] } | null> {
  return fetchFromBackend<{
    passed: boolean;
    corrected_text: string;
    hallucinations_detected: string[];
  }>('/ai-assistant/validate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type PartnerType = 'guide' | 'agency' | 'hotel' | 'vehicle' | 'transport';

export interface PartnerOnboardingPayload {
  name: string;
  business_name: string;
  partner_type: PartnerType | string;
  district: string;
  province: string;
  latitude: number;
  longitude: number;
  address?: string;
  contact_number: string;
  email?: string;
  website?: string;
  sltda_license_number?: string;
  price_range?: string;
  baseline_rate?: number;
  services?: string[];
  associated_destination_ids?: number[];
  image_url?: string;
}

export interface PartnerProfile {
  id: number;
  name: string;
  business_name: string;
  partner_type: string;
  district: string;
  province: string;
  latitude: number;
  longitude: number;
  address?: string;
  contact_number: string;
  email?: string;
  website?: string;
  sltda_license_number?: string;
  verification_state: string;
  is_verified: boolean;
  is_featured: boolean;
  featured_tier: string;
  rating: number;
  reviews_count: number;
  price_range: string;
  baseline_rate: number;
  services: string[];
  associated_destination_ids: number[];
  image_url: string;
  distance_km?: number;
  created_at?: string;
}

export interface PartnerListResponse {
  partners: PartnerProfile[];
  total: number;
  featured_count: number;
  filter_type?: string;
  filter_district?: string;
  query_time_ms: number;
}

export async function onboardPartner(
  payload: PartnerOnboardingPayload
): Promise<PartnerProfile | null> {
  return fetchFromBackend<PartnerProfile>('/partners/onboard', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPartners(params?: {
  partner_type?: string;
  district?: string;
  province?: string;
  verified_only?: boolean;
  featured_only?: boolean;
  destination_id?: number;
}): Promise<PartnerListResponse | null> {
  const query = new URLSearchParams();
  if (params?.partner_type) query.append('partner_type', params.partner_type);
  if (params?.district) query.append('district', params.district);
  if (params?.province) query.append('province', params.province);
  if (params?.verified_only) query.append('verified_only', 'true');
  if (params?.featured_only) query.append('featured_only', 'true');
  if (params?.destination_id) query.append('destination_id', params.destination_id.toString());
  const queryString = query.toString();
  return fetchFromBackend<PartnerListResponse>(`/partners${queryString ? `?${queryString}` : ''}`);
}

export async function getNearbyPartners(params: {
  lat: number;
  lng: number;
  radius_km?: number;
  partner_type?: string;
  destination_id?: number;
}): Promise<PartnerListResponse | null> {
  const query = new URLSearchParams();
  query.append('lat', params.lat.toString());
  query.append('lng', params.lng.toString());
  if (params.radius_km) query.append('radius_km', params.radius_km.toString());
  if (params.partner_type) query.append('partner_type', params.partner_type);
  if (params.destination_id) query.append('destination_id', params.destination_id.toString());
  return fetchFromBackend<PartnerListResponse>(`/partners/nearby?${query.toString()}`);
}

export async function getPartnerById(partnerId: number): Promise<PartnerProfile | null> {
  return fetchFromBackend<PartnerProfile>(`/partners/${partnerId}`);
}

export async function getDestinationPartnersList(
  destinationId: number
): Promise<PartnerListResponse | null> {
  return fetchFromBackend<PartnerListResponse>(`/partners/destination/${destinationId}`);
}

export type ArrangementMode = 'guided' | 'independent';

export interface ArrangementMatchRequest {
  trip_id?: number;
  mode?: ArrangementMode;
  destination_ids?: number[];
  starting_location?: string;
  district?: string;
  partner_type_filter?: string;
}

export interface TripPartnerMatchItem {
  partner: PartnerProfile;
  match_score: number;
  matching_destinations: string[];
  recommended_for_mode: ArrangementMode;
  relevance_reason: string;
  estimated_cost_per_day: number;
}

export interface TripArrangementResponse {
  trip_id?: number;
  mode: ArrangementMode;
  matched_partners: TripPartnerMatchItem[];
  guided_options_count: number;
  independent_options_count: number;
  total_matched: number;
  query_time_ms: number;
}

export interface ReferralInquiryPayload {
  trip_id?: number;
  partner_id: number;
  arrangement_mode: ArrangementMode;
  customer_name: string;
  customer_contact: string;
  customer_email?: string;
  start_date?: string;
  end_date?: string;
  group_size?: number;
  custom_notes?: string;
}

export interface ReferralInquiryRecord {
  referral_id: number;
  referral_code: string;
  trip_id?: number;
  partner_id: number;
  partner_name: string;
  partner_type: string;
  arrangement_mode: ArrangementMode;
  customer_name: string;
  customer_contact: string;
  customer_email?: string;
  start_date?: string;
  end_date?: string;
  group_size: number;
  status: string;
  estimated_cost: number;
  custom_notes?: string;
  created_at: string;
}

export async function matchTripArrangements(
  payload: ArrangementMatchRequest
): Promise<TripArrangementResponse | null> {
  return fetchFromBackend<TripArrangementResponse>('/arrangements/match', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getTripArrangementsByTripId(
  tripId: number,
  mode: ArrangementMode = 'guided',
  partnerTypeFilter?: string
): Promise<TripArrangementResponse | null> {
  const query = new URLSearchParams();
  query.append('mode', mode);
  if (partnerTypeFilter) query.append('partner_type_filter', partnerTypeFilter);
  return fetchFromBackend<TripArrangementResponse>(
    `/arrangements/trip/${tripId}?${query.toString()}`
  );
}

export async function createReferralInquiry(
  payload: ReferralInquiryPayload
): Promise<ReferralInquiryRecord | null> {
  return fetchFromBackend<ReferralInquiryRecord>('/arrangements/inquire', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getReferralStatus(
  referralCode: string
): Promise<ReferralInquiryRecord | null> {
  return fetchFromBackend<ReferralInquiryRecord>(`/arrangements/referrals/${referralCode}`);
}
