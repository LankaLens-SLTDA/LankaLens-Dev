/**
 * Client-Side Telemetry & Analytics Module (EPIC 23)
 * Provides lightweight, privacy-focused anonymous event tracking.
 */

const SESSION_STORAGE_KEY = 'lankalens_analytics_session_id';

export interface TrackEventOptions {
  category: 'discovery' | 'planning' | 'community' | 'sustainability' | 'marketplace';
  eventName: string;
  entityType?: string;
  entityId?: string;
  properties?: Record<string, unknown>;
}

/**
 * Returns or generates an anonymous session ID stored in browser localStorage.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return 'sess_ssr_anonymous';
  }

  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = `sess_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Tracks an anonymized user interaction event asynchronously.
 */
export async function trackEvent({
  category,
  eventName,
  entityType,
  entityId,
  properties = {},
}: TrackEventOptions): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    await fetch(`${API_BASE}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        category,
        event_name: eventName,
        entity_type: entityType,
        entity_id: entityId,
        properties,
        device_type:
          typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop',
      }),
    });
  } catch (err) {
    // Silent fail to ensure telemetry never interrupts user experience
    console.debug('[LankaLens Telemetry Debug]', err);
  }
}

// Convenience Helper Functions
export const analytics = {
  trackDestinationView: (id: string | number, name: string, crowdLevel?: string) =>
    trackEvent({
      category: 'discovery',
      eventName: 'destination_viewed',
      entityType: 'destination',
      entityId: String(id),
      properties: { destination_name: name, crowd_level: crowdLevel || 'Moderate' },
    }),

  trackSearch: (query: string, resultsCount: number) =>
    trackEvent({
      category: 'discovery',
      eventName: 'search_executed',
      properties: { query, results_count: resultsCount },
    }),

  trackHighCrowdWarning: (destinationId: string | number, destinationName: string) =>
    trackEvent({
      category: 'sustainability',
      eventName: 'high_crowd_warning_viewed',
      entityType: 'destination',
      entityId: String(destinationId),
      properties: { destination_name: destinationName, crowd_density: 'High' },
    }),

  trackAlternativeClick: (originalId: string | number, altId: string | number, altName: string) =>
    trackEvent({
      category: 'sustainability',
      eventName: 'alternative_accepted',
      entityType: 'destination',
      entityId: String(altId),
      properties: { original_destination_id: String(originalId), alternative_name: altName },
    }),

  trackBudgetCalculated: (days: number, budget: number) =>
    trackEvent({
      category: 'planning',
      eventName: 'budget_calculated',
      properties: { days_count: days, total_budget: budget },
    }),

  trackMarketplaceView: (partnerId: string | number, partnerName: string, type: string) =>
    trackEvent({
      category: 'marketplace',
      eventName: 'partner_profile_viewed',
      entityType: 'partner',
      entityId: String(partnerId),
      properties: { partner_name: partnerName, partner_type: type },
    }),

  trackArrangementInquiry: (partnerId: string | number, referralCode: string, mode: string) =>
    trackEvent({
      category: 'marketplace',
      eventName: 'arrangement_inquiry_submitted',
      entityType: 'partner',
      entityId: String(partnerId),
      properties: { referral_code: referralCode, mode },
    }),
};
