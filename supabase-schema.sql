-- ==============================================================================
-- HARVVEST Stock Market Institution — Supabase Database Schema & RLS Policies
-- ==============================================================================
-- Run this script in your Supabase Dashboard:
-- 1. Go to your Supabase Project -> SQL Editor
-- 2. Paste this entire file and click "Run"
--
-- IMPORTANT SETUP CHECKLIST:
-- 1. Disable Public Registration:
--    Supabase Dashboard -> Authentication -> Providers -> Email:
--    UNCHECK "Allow new users to sign up" (or in Authentication -> Settings: disable User Signups).
--    This ensures that ONLY invited or pre-created administrator accounts exist.
--
-- 2. Obtain Your Verified Admin User ID (UID):
--    Supabase Dashboard -> Authentication -> Users.
--    Find your admin user email (e.g. nakultrader007@gmail.com) and copy the UUID.
--    Place this UUID into your environment variable: ADMIN_USER_IDS="<your-uuid>"
--
-- 3. Row Level Security (RLS):
--    Enabled on all tables below. Public visitors can ONLY read published rows.
--    Draft content, private settings, and student enquiry phone numbers are strictly protected.
-- ==============================================================================

-- 1. Upcoming Batches Table
CREATE TABLE IF NOT EXISTS public.batches (
  id TEXT PRIMARY KEY,                       -- e.g. 'BATCH-2026-05A'
  program TEXT NOT NULL,                     -- Program name
  start_date TEXT NOT NULL,                  -- Display or ISO start date
  days TEXT NOT NULL,                        -- e.g. 'Mon, Wed, Fri'
  timings TEXT NOT NULL,                     -- e.g. '07:30 PM - 09:30 PM IST'
  mode TEXT NOT NULL DEFAULT 'Offline',      -- 'Offline' | 'Online' | 'Offline / Online'
  status TEXT NOT NULL DEFAULT 'draft',      -- 'published' | 'draft'
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Demo Videos Table
CREATE TABLE IF NOT EXISTS public.demo_videos (
  id TEXT PRIMARY KEY,                       -- Unique video identifier
  title TEXT NOT NULL,                       -- Official video title
  video_url TEXT NOT NULL,                   -- Video source or streaming URL
  thumbnail_url TEXT,                        -- Thumbnail image path/URL
  description TEXT,                          -- Optional preview description
  sort_order INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',      -- 'published' | 'draft'
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Student Video Reviews Table
CREATE TABLE IF NOT EXISTS public.student_reviews (
  id TEXT PRIMARY KEY,                       -- Unique review identifier
  student_name TEXT,                         -- Student name (optional)
  caption TEXT,                              -- Student review note / caption
  video_url TEXT NOT NULL,                   -- Video source or streaming URL
  thumbnail_url TEXT,                        -- Thumbnail image path/URL
  sort_order INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',      -- 'published' | 'draft'
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Student Photo Gallery Table
CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id TEXT PRIMARY KEY,                       -- Unique photo identifier
  title TEXT,                                -- Photo title
  image_url TEXT NOT NULL,                   -- Supabase Storage or CDN URL
  caption TEXT,                              -- Optional classroom / event caption
  sort_order INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',      -- 'published' | 'draft'
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Website Content & Copy Table
CREATE TABLE IF NOT EXISTS public.website_settings (
  section_key TEXT PRIMARY KEY,              -- e.g. 'hero', 'about_harvvest', 'learning_formats'
  content_json JSONB NOT NULL,               -- Headings, body text, stats
  is_public BOOLEAN DEFAULT true,            -- Whether exposed publicly
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Student Enquiries Table (Confidential Booking Records)
CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY,                       -- e.g. 'ENQ-1718000000000'
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  program TEXT DEFAULT 'General Inquiry',
  mode TEXT DEFAULT 'Offline (Adajan Campus, Surat)',
  batch_id TEXT,
  batch_details TEXT,
  message TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  synced_to_sheet BOOLEAN DEFAULT false
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- PUBLIC READ POLICIES (Only published content is readable by the public)
-- ==============================================================================

-- Batches: Public can only view published batches
DROP POLICY IF EXISTS "Public can view published batches" ON public.batches;
CREATE POLICY "Public can view published batches"
  ON public.batches FOR SELECT
  USING (status = 'published');

-- Demo Videos: Public can only view published videos
DROP POLICY IF EXISTS "Public can view published demo videos" ON public.demo_videos;
CREATE POLICY "Public can view published demo videos"
  ON public.demo_videos FOR SELECT
  USING (status = 'published');

-- Student Reviews: Public can only view published reviews
DROP POLICY IF EXISTS "Public can view published student reviews" ON public.student_reviews;
CREATE POLICY "Public can view published student reviews"
  ON public.student_reviews FOR SELECT
  USING (status = 'published');

-- Gallery Photos: Public can only view published photos
DROP POLICY IF EXISTS "Public can view published gallery photos" ON public.gallery_photos;
CREATE POLICY "Public can view published gallery photos"
  ON public.gallery_photos FOR SELECT
  USING (status = 'published');

-- Website Settings: Public can only view public settings
DROP POLICY IF EXISTS "Public can view public website settings" ON public.website_settings;
CREATE POLICY "Public can view public website settings"
  ON public.website_settings FOR SELECT
  USING (is_public = true);

-- Enquiries: Anyone can INSERT an enquiry (from the booking modal)
DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;
CREATE POLICY "Public can submit enquiries"
  ON public.enquiries FOR INSERT
  WITH CHECK (true);

-- CRITICAL PRIVACY: Public CANNOT SELECT/READ enquiries (protecting student phone numbers)
-- No public SELECT policy exists for enquiries.

-- ==============================================================================
-- SERVICE ROLE (SERVER-SIDE ADMIN) POLICIES
-- The Supabase Service Role key bypasses RLS automatically, ensuring your
-- server-side verified admin endpoints can manage all records, drafts, and enquiries.
-- ==============================================================================
