-- ============================================
-- Supabase SQL Schema
-- Personalized Travel Itinerary Planner
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    preferred_currency TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget NUMERIC(10, 2),
    currency TEXT DEFAULT 'USD',
    group_size INTEGER DEFAULT 1,
    travel_style TEXT CHECK (travel_style IN ('relaxed', 'moderate', 'fast')),
    vibe TEXT CHECK (vibe IN ('adventure', 'luxury', 'budget', 'romantic', 'family', 'culture')),
    interests TEXT[],
    dietary_restrictions TEXT[],
    mobility_concerns TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    is_shared BOOLEAN DEFAULT FALSE,
    share_token TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ITINERARIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.itineraries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    day_number INTEGER NOT NULL,
    date DATE,
    morning_activities JSONB DEFAULT '[]',
    afternoon_activities JSONB DEFAULT '[]',
    evening_activities JSONB DEFAULT '[]',
    accommodation JSONB DEFAULT '{}',
    meals JSONB DEFAULT '{}',
    transportation JSONB DEFAULT '{}',
    estimated_cost NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SAVED PLACES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.saved_places (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT CHECK (category IN ('attraction', 'restaurant', 'hotel', 'activity', 'other')),
    description TEXT,
    rating NUMERIC(2,1),
    image_url TEXT,
    notes TEXT,
    coordinates JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIP HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trips policies
CREATE POLICY "Users can manage own trips" ON public.trips
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view shared trips" ON public.trips
    FOR SELECT USING (is_shared = TRUE);

-- Itineraries policies
CREATE POLICY "Users can manage itineraries of own trips" ON public.itineraries
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.trips WHERE trips.id = itineraries.trip_id AND trips.user_id = auth.uid())
    );

-- Saved places policies
CREATE POLICY "Users can manage own saved places" ON public.saved_places
    FOR ALL USING (auth.uid() = user_id);

-- Trip history policies
CREATE POLICY "Users can view own trip history" ON public.trip_history
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trip history" ON public.trip_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trips_updated_at BEFORE UPDATE ON public.trips
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER itineraries_updated_at BEFORE UPDATE ON public.itineraries
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
