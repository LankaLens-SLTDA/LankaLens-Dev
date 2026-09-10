-- ========================================================
-- LankaLens Supabase Database Schema & Initial Migration
-- ========================================================

-- Enable PostGIS extension for cartographic spatial indexing
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DESTINATIONS TABLE
CREATE TABLE IF NOT EXISTS public.destinations (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'temple', 'nature', 'beach', 'wildlife'
    region VARCHAR(100) NOT NULL,  -- 'Cultural Triangle', 'Hill Country', 'Southern Coast'
    rating NUMERIC(3, 2) DEFAULT 4.5,
    reviews INTEGER DEFAULT 0,
    description TEXT,
    image_url TEXT,
    coord_x VARCHAR(20) NOT NULL,   -- e.g. "28%"
    coord_y VARCHAR(20) NOT NULL,   -- e.g. "22%"
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    elevation VARCHAR(50),
    distance_from_colombo VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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
    hazard_category VARCHAR(100) NOT NULL, -- 'litter', 'trail_damage', 'landslide', 'wildlife_risk'
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'under_review', -- 'under_review', 'verified', 'resolved'
    reward_points INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL,
    author_role VARCHAR(50) DEFAULT 'Explorer',
    author_avatar TEXT,
    location_name VARCHAR(255) NOT NULL,
    image_url TEXT,
    caption TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    eco_points INTEGER DEFAULT 0,
    is_ai_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazard_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to destinations, public itineraries, hazards & posts
CREATE POLICY "Public destinations are viewable by everyone" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Public itineraries are viewable by everyone" ON public.itineraries FOR SELECT USING (is_public = true);
CREATE POLICY "Public hazards are viewable by everyone" ON public.hazard_reports FOR SELECT USING (true);
CREATE POLICY "Public posts are viewable by everyone" ON public.community_posts FOR SELECT USING (true);

-- Allow authenticated users to insert hazard reports and community posts
CREATE POLICY "Authenticated users can create hazard reports" ON public.hazard_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR true);
CREATE POLICY "Authenticated users can create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR true);

-- ========================================================
-- SEED DATA INSERTION
-- ========================================================

INSERT INTO public.destinations (title, category, region, rating, reviews, description, image_url, coord_x, coord_y, elevation, distance_from_colombo)
VALUES 
    ('Sigiriya Ancient Rock Fortress', 'temple', 'Cultural Triangle', 4.9, 320, '5th-century royal citadel towering 200 meters over emerald jungle, famous for frescoes and water gardens.', '/stitch_images/planner.png', '28%', '22%', '349 m', '165 km from Colombo'),
    ('Ella Nine Arch Bridge & Demodara', 'nature', 'Hill Country', 4.9, 512, 'Iconic colonial viaduct tucked into dense tea hills, where blue trains cross scenic mountain valleys.', '/stitch_images/discover.png', '52%', '48%', '1,041 m', '200 km from Colombo'),
    ('Mirissa Coconut Tree Hill & Secret Beach', 'beach', 'Southern Coast', 4.8, 240, 'Dramatic red-clay headland lined with coconut palms overlooking turquoise Indian Ocean waves.', '/stitch_images/map.png', '70%', '75%', '15 m', '150 km from Colombo'),
    ('Yala National Park Safari', 'wildlife', 'Southern Province', 4.9, 410, 'World famous leopard habitat with dense jungle lagoons and herds of Asian elephants.', '/stitch_images/sustainability.png', '65%', '80%', '30 m', '290 km from Colombo')
ON CONFLICT DO NOTHING;
