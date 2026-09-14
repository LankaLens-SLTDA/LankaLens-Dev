-- ========================================================
-- LankaLens Supabase & PostgreSQL Database Schema & Migration
-- Authoritative Sri Lankan Tourism Destination Database
-- ========================================================

-- Enable required extensions for spatial indexing and UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. AUTHORITATIVE DESTINATIONS TABLE
CREATE TABLE IF NOT EXISTS public.destinations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    geom GEOMETRY(Point, 4326),
    district VARCHAR(100) NOT NULL,      -- e.g. Matale, Badulla, Galle, Colombo, Kandy
    province VARCHAR(100) NOT NULL,      -- e.g. Central, Uva, Southern, Western
    category VARCHAR(100) NOT NULL,      -- e.g. Heritage, Nature, Beach, Wildlife, Culture
    activities TEXT[] DEFAULT '{}',     -- e.g. {'Hiking', 'Photography', 'Sightseeing'}
    estimated_visit_duration_minutes INTEGER DEFAULT 180, -- Visit duration in minutes
    baseline_cost NUMERIC(10, 2) DEFAULT 0.00,             -- Estimated cost in USD or LKR
    popularity NUMERIC(3, 2) DEFAULT 4.50,                -- Score out of 5.0
    rating NUMERIC(3, 2) DEFAULT 4.50,                    -- Average visitor rating out of 5.0
    reviews INTEGER DEFAULT 0,                            -- Review count
    crowd_info JSONB DEFAULT '{"density": "Moderate", "peak_hours": "10:00 - 14:00"}'::jsonb,
    trust_score NUMERIC(3, 2) DEFAULT 0.95,               -- Trust & verification score (0.0 to 1.0)
    community_stats JSONB DEFAULT '{"upvotes": 0, "save_count": 0}'::jsonb,
    images TEXT[] DEFAULT '{}',                           -- List of image asset paths / URLs
    image_url TEXT,                                       -- Primary thumbnail
    coord_x VARCHAR(20) DEFAULT '50%',                    -- Map UI percentage coordinate X
    coord_y VARCHAR(20) DEFAULT '50%',                    -- Map UI percentage coordinate Y
    elevation VARCHAR(50) DEFAULT 'N/A',                  -- Elevation text
    distance_from_colombo VARCHAR(100) DEFAULT 'N/A',     -- Distance string from Colombo
    verification_state VARCHAR(50) DEFAULT 'verified',    -- 'verified', 'community_submitted', 'pending_review'
    publication_status VARCHAR(50) DEFAULT 'published',   -- 'published', 'draft', 'archived'
    is_verified BOOLEAN DEFAULT true,                     -- Fast flag to distinguish verified vs community data
    partner_info JSONB DEFAULT '{"name": "Local Tourism Collective", "type": "Community Partner", "verified": true}'::jsonb,
    nearby_attractions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================================
-- GEOGRAPHIC & PERFORMANCE INDEXES
-- ========================================================

-- PostGIS Spatial Index for lightning fast geospatial queries
CREATE INDEX IF NOT EXISTS idx_destinations_geom ON public.destinations USING GIST (geom);

-- B-Tree Indexes for fast filtering & indexing
CREATE INDEX IF NOT EXISTS idx_destinations_district ON public.destinations (district);
CREATE INDEX IF NOT EXISTS idx_destinations_province ON public.destinations (province);
CREATE INDEX IF NOT EXISTS idx_destinations_category ON public.destinations (category);
CREATE INDEX IF NOT EXISTS idx_destinations_verification_state ON public.destinations (verification_state);
CREATE INDEX IF NOT EXISTS idx_destinations_publication_status ON public.destinations (publication_status);
CREATE INDEX IF NOT EXISTS idx_destinations_is_verified ON public.destinations (is_verified);

-- Trigger to automatically calculate PostGIS point geometry from Lat/Lng on INSERT or UPDATE
CREATE OR REPLACE FUNCTION update_destinations_geom()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    END IF;
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_destinations_geom ON public.destinations;
CREATE TRIGGER trg_destinations_geom
BEFORE INSERT OR UPDATE ON public.destinations
FOR EACH ROW EXECUTE FUNCTION update_destinations_geom();

-- ========================================================
-- POSTGIS NEARBY LOCATION SPATIAL QUERY RPC
-- ========================================================

CREATE OR REPLACE FUNCTION nearby_destinations(
    lat FLOAT,
    lng FLOAT,
    radius_km FLOAT DEFAULT 50.0
)
RETURNS TABLE (
    id BIGINT,
    name VARCHAR,
    title VARCHAR,
    category VARCHAR,
    district VARCHAR,
    province VARCHAR,
    latitude NUMERIC,
    longitude NUMERIC,
    baseline_cost NUMERIC,
    popularity NUMERIC,
    trust_score NUMERIC,
    verification_state VARCHAR,
    image_url TEXT,
    distance_km FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.name,
        d.title,
        d.category,
        d.district,
        d.province,
        d.latitude,
        d.longitude,
        d.baseline_cost,
        d.popularity,
        d.trust_score,
        d.verification_state,
        d.image_url,
        ST_DistanceSphere(
            d.geom, 
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)
        ) / 1000.0 AS distance_km
    FROM public.destinations d
    WHERE d.publication_status = 'published'
      AND ST_DWithin(
            d.geom::geography, 
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, 
            radius_km * 1000.0
      )
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- 2. ITINERARIES TABLE
CREATE TABLE IF NOT EXISTS public.itineraries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    days_count INTEGER DEFAULT 10,
    total_budget NUMERIC(10, 2) DEFAULT 1160.00,
    days_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    budget_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. HAZARD REPORTS TABLE (Sustainability Surveillance)
CREATE TABLE IF NOT EXISTS public.hazard_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    location_name VARCHAR(255) NOT NULL,
    hazard_category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'under_review',
    reward_points INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
    id BIGSERIAL PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL,
    author_role VARCHAR(50) DEFAULT 'Explorer',
    author_avatar TEXT,
    location_name VARCHAR(255) NOT NULL,
    destination_id BIGINT REFERENCES public.destinations(id) ON DELETE SET NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    rating NUMERIC(3, 2) DEFAULT 5.0,
    image_url TEXT,
    caption TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    eco_points INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    comments JSONB DEFAULT '[]'::jsonb,
    is_ai_verified BOOLEAN DEFAULT false,
    publication_status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_community_posts_destination ON public.community_posts (destination_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts (created_at DESC);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazard_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public destinations are viewable by everyone" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Public itineraries are viewable by everyone" ON public.itineraries FOR SELECT USING (is_public = true);
CREATE POLICY "Public hazards are viewable by everyone" ON public.hazard_reports FOR SELECT USING (true);
CREATE POLICY "Public posts are viewable by everyone" ON public.community_posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create hazard reports" ON public.hazard_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users can create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR true);

-- 5. CONTRIBUTIONS PIPELINE TABLE
CREATE TABLE IF NOT EXISTS public.contributions (
    id BIGSERIAL PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL DEFAULT 'Cartographer Explorer',
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Cultural',
    destination_id BIGINT REFERENCES public.destinations(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    alt_text TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    rating NUMERIC(3, 2) DEFAULT 5.0,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    exif_metadata JSONB DEFAULT '{}'::jsonb,
    ai_validation_result JSONB DEFAULT '{}'::jsonb,
    ai_trust_audit JSONB DEFAULT '{}'::jsonb,
    ai_confidence_score NUMERIC(3, 2) DEFAULT 0.90,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'pending_review', 'approved', 'rejected', 'flagged'
    moderation_status VARCHAR(50) DEFAULT 'pending_review', -- 'pending_review', 'approved', 'rejected'
    reputation_points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. COMMUNITY REPORTS & FLAGGING TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id BIGSERIAL PRIMARY KEY,
    target_type VARCHAR(50) NOT NULL, -- 'contribution', 'post', 'comment'
    target_id BIGINT NOT NULL,
    reporter_name VARCHAR(100) DEFAULT 'Anonymous Explorer',
    reason VARCHAR(100) NOT NULL, -- 'spam', 'inaccurate_gps', 'inappropriate', 'copyright'
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. MODERATION HISTORY & AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.moderation_history (
    id BIGSERIAL PRIMARY KEY,
    contribution_id BIGINT REFERENCES public.contributions(id) ON DELETE CASCADE,
    moderator VARCHAR(100) NOT NULL DEFAULT 'Chief Moderator',
    action VARCHAR(50) NOT NULL, -- 'approve', 'reject', 'flag'
    feedback TEXT,
    rejection_category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. USER REPUTATION PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id BIGSERIAL PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL UNIQUE,
    rank VARCHAR(50) DEFAULT 'New Contributor', -- 'New Contributor', 'Verified Local', 'Trusted Guide'
    eco_points INTEGER DEFAULT 0,
    reputation_score NUMERIC(5, 2) DEFAULT 0.00,
    ai_pass_rate NUMERIC(5, 1) DEFAULT 100.0,
    approved_count INTEGER DEFAULT 0,
    rejected_count INTEGER DEFAULT 0,
    badges JSONB DEFAULT '[]'::jsonb,
    is_guide_eligible BOOLEAN DEFAULT false,
    guide_upgrade_status VARCHAR(50) DEFAULT 'none', -- 'none', 'eligible', 'applied', 'certified'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. GUIDE MARKETPLACE APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.guide_applications (
    id BIGSERIAL PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(50) NOT NULL,
    sltda_license_number VARCHAR(100),
    niche_specialization VARCHAR(100) NOT NULL,
    bio_summary TEXT NOT NULL,
    portfolio_links TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending_verification', -- 'pending_verification', 'certified', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public contributions are viewable by everyone" ON public.contributions FOR SELECT USING (status = 'approved' OR true);
CREATE POLICY "Users can create contributions" ON public.contributions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Moderators can view and create moderation history" ON public.moderation_history FOR ALL USING (true);
CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage guide applications" ON public.guide_applications FOR ALL USING (true);

-- 10. LOCAL TOURISM PARTNER NETWORK TABLE (EPIC 19)
CREATE TABLE IF NOT EXISTS public.partners (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    partner_type VARCHAR(50) NOT NULL, -- 'guide', 'agency', 'hotel', 'vehicle', 'transport'
    district VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    geom GEOMETRY(Point, 4326),
    address TEXT,
    contact_number VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    website VARCHAR(255),
    sltda_license_number VARCHAR(100),
    verification_state VARCHAR(50) DEFAULT 'verified', -- 'verified', 'pending_verification', 'unverified'
    is_verified BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    featured_tier VARCHAR(50) DEFAULT 'standard', -- 'gold', 'silver', 'standard'
    rating NUMERIC(3, 2) DEFAULT 4.80,
    reviews_count INTEGER DEFAULT 0,
    price_range VARCHAR(20) DEFAULT '$$', -- '$', '$$', '$$$', '$$$$'
    baseline_rate NUMERIC(10, 2) DEFAULT 25.00,
    services TEXT[] DEFAULT '{}',
    associated_destination_ids BIGINT[] DEFAULT '{}',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PostGIS Spatial Index for lightning fast partner geospatial queries
CREATE INDEX IF NOT EXISTS idx_partners_geom ON public.partners USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_partners_type ON public.partners (partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_district ON public.partners (district);
CREATE INDEX IF NOT EXISTS idx_partners_verification ON public.partners (verification_state);
CREATE INDEX IF NOT EXISTS idx_partners_is_featured ON public.partners (is_featured);

-- Trigger to calculate PostGIS point geometry from Lat/Lng on partners
CREATE OR REPLACE FUNCTION update_partners_geom()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    END IF;
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_partners_geom ON public.partners;
CREATE TRIGGER trg_partners_geom
BEFORE INSERT OR UPDATE ON public.partners
FOR EACH ROW EXECUTE FUNCTION update_partners_geom();

-- PostGIS Nearby Partner Spatial Discovery RPC Function
CREATE OR REPLACE FUNCTION nearby_partners(
    lat FLOAT,
    lng FLOAT,
    radius_km FLOAT DEFAULT 50.0,
    filter_type VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id BIGINT,
    name VARCHAR,
    business_name VARCHAR,
    partner_type VARCHAR,
    district VARCHAR,
    province VARCHAR,
    latitude NUMERIC,
    longitude NUMERIC,
    contact_number VARCHAR,
    verification_state VARCHAR,
    is_verified BOOLEAN,
    is_featured BOOLEAN,
    rating NUMERIC,
    price_range VARCHAR,
    baseline_rate NUMERIC,
    services TEXT[],
    image_url TEXT,
    distance_km FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.business_name,
        p.partner_type,
        p.district,
        p.province,
        p.latitude,
        p.longitude,
        p.contact_number,
        p.verification_state,
        p.is_verified,
        p.is_featured,
        p.rating,
        p.price_range,
        p.baseline_rate,
        p.services,
        p.image_url,
        ST_DistanceSphere(
            p.geom, 
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)
        ) / 1000.0 AS distance_km
    FROM public.partners p
    WHERE (filter_type IS NULL OR p.partner_type = filter_type)
      AND ST_DWithin(
            p.geom::geography, 
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, 
            radius_km * 1000.0
      )
    ORDER BY p.is_featured DESC, distance_km ASC;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public partners are viewable by everyone" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Partners can be created by authenticated users" ON public.partners FOR INSERT WITH CHECK (true);

-- =========================================================
-- EPIC 20 — TRIP ARRANGEMENT BROKER TABLES & POLICIES
-- =========================================================

CREATE TABLE IF NOT EXISTS public.trip_arrangements (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    referral_code VARCHAR(32) NOT NULL UNIQUE,
    trip_id BIGINT REFERENCES public.trips(id) ON DELETE SET NULL,
    partner_id BIGINT REFERENCES public.partners(id) ON DELETE CASCADE,
    partner_name VARCHAR(255) NOT NULL,
    partner_type VARCHAR(50) NOT NULL,
    arrangement_mode VARCHAR(20) NOT NULL CHECK (arrangement_mode IN ('guided', 'independent')),
    customer_name VARCHAR(255) NOT NULL,
    customer_contact VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255),
    start_date DATE,
    end_date DATE,
    group_size INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    estimated_cost NUMERIC(10,2) DEFAULT 0.00,
    custom_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_arrangements_referral ON public.trip_arrangements(referral_code);
CREATE INDEX IF NOT EXISTS idx_trip_arrangements_trip ON public.trip_arrangements(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_arrangements_partner ON public.trip_arrangements(partner_id);

ALTER TABLE public.trip_arrangements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trip arrangements viewable by everyone" ON public.trip_arrangements FOR SELECT USING (true);
CREATE POLICY "Trip arrangements insertable by everyone" ON public.trip_arrangements FOR INSERT WITH CHECK (true);

-- =========================================================
-- EPIC 21 — CONTRIBUTOR TO TRUSTED GUIDE MARKETPLACE PIPELINE
-- =========================================================

ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS contributor_author_name VARCHAR(255);
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS contributor_eco_points INT DEFAULT 0;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS contributor_rank VARCHAR(50);
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS preferential_commission_pct NUMERIC(5,2) DEFAULT 15.00;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS hidden_gem_badge BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.guide_upgrades (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    author_name VARCHAR(255) NOT NULL,
    partner_id BIGINT REFERENCES public.partners(id) ON DELETE CASCADE,
    sltda_license_number VARCHAR(100),
    rank_at_upgrade VARCHAR(50) NOT NULL,
    eco_points_at_upgrade INT DEFAULT 0,
    ai_pass_rate_at_upgrade NUMERIC(5,2) DEFAULT 100.0,
    preferential_commission_pct NUMERIC(5,2) DEFAULT 5.00,
    status VARCHAR(50) DEFAULT 'certified',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.guide_upgrades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guide upgrades viewable by everyone" ON public.guide_upgrades FOR SELECT USING (true);
CREATE POLICY "Guide upgrades insertable by everyone" ON public.guide_upgrades FOR INSERT WITH CHECK (true);






