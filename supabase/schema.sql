-- WelNex Alternative Investment Marketplace Database Schema
-- Pivot from LMS to fintech marketplace

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE USERS TABLE (extends existing auth)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  -- Role: user, admin, investment_provider, accredited_investor
  role TEXT CHECK (role IN ('user', 'admin', 'investment_provider', 'accredited_investor')) DEFAULT 'user',
  -- Provider-specific fields
  company_name TEXT,
  registration_number TEXT,
  -- Accredited investor status
  is_accredited BOOLEAN DEFAULT false,
  net_worth NUMERIC(15,2),
  annual_income NUMERIC(15,2),
  -- Gamification (tracking)
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Investment CATEGORIES (dynamic, unlimited hierarchy)
-- ============================================
CREATE TABLE IF NOT EXISTS investment_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  -- Parent category for hierarchy (self-referencing)
  parent_category_id UUID REFERENCES investment_categories(id) ON DELETE SET NULL,
  -- For root categories
  is_root BOOLEAN DEFAULT true,
  -- Category type for filtering
  category_type TEXT CHECK (category_type IN ('primary', 'sub', 'niche')) DEFAULT 'primary',
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  -- Status
  is_active BOOLEAN DEFAULT true,
  -- Ordering
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- ============================================
-- Investment PROVIDERS/Partners
-- ============================================
CREATE TABLE IF NOT EXISTS investment_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  -- Provider type
  provider_type TEXT CHECK (provider_type IN ('aif_manager', 'reit_manager', 'invIT_manager', 'pms_provider', 'private_credit_platform', 'wealth_manager', 'family_office', 'other')) NOT NULL,
  -- Regulation
  regulator TEXT,
  registration_number TEXT,
  -- Contact
  website_url TEXT,
  contact_email TEXT,
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  -- Status
  is_active BOOLEAN DEFAULT true,
  -- Ordering
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- ============================================
-- Investment LISTINGS (the core marketplace items)
-- ============================================
CREATE TABLE IF NOT EXISTS investment_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Basic info
  name TEXT NOT NULL,
  -- Category hierarchy
  category_id UUID REFERENCES investment_categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES investment_categories(id) ON DELETE SET NULL,
  -- Provider
  provider_id UUID REFERENCES investment_providers(id) ON DELETE SET NULL,
  -- Investment details
  description TEXT, -- Rich HTML
  minimum_investment NUMERIC(12,2) CHECK (minimum_investment >= 0),
  expected_returns NUMERIC(8,2), -- Annualized percentage
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'very_high')) DEFAULT 'medium',
  liquidity TEXT CHECK (liquidity IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'lock_in')) NOT NULL,
  investment_horizon TEXT, -- e.g., "3-5 years", "5-10 years", "10+ years"
  -- Regulation/Eligibility
  regulator TEXT,
  registration_number TEXT,
  eligibility_criteria TEXT, -- Rich HTML, e.g., "Accredited investors only", "Min INR 50L", etc.
  -- Financials
  fund_size NUMERIC(15,2),
  asset_class TEXT,
  -- Fees and taxation
  fee_structure TEXT, -- Rich HTML, e.g., "Management fee 1.5%, Performance fee 10%"
  taxation TEXT, -- Rich HTML, e.g., "Long-term capital gains tax applicable"
  exit_load TEXT,
  -- Media
  logo_url TEXT,
  banner_url TEXT,
  -- Status
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  -- Metadata
  order_index INTEGER DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- ============================================
-- Investment COMPARISONS
-- ============================================
CREATE TABLE IF NOT EXISTS investment_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Snapshots of compared investments at the time of comparison
  investment_a_id UUID REFERENCES investment_listings(id) ON DELETE CASCADE,
  investment_b_id UUID REFERENCES investment_listings(id) ON DELETE CASCADE,
  -- Comparison attributes stored as JSONB
  comparison_attributes JSONB NOT NULL DEFAULT '{}',
  -- User who created the comparison (if signed in)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- ============================================
-- Waitlist (expanded for CRM integration)
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  occupation TEXT,
  income_range TEXT CHECK (income_range IN ('below_5L', '5L_10L', '10L_20L', '20L_50L', 'above_50L')) DEFAULT 'below_5L',
  investment_experience TEXT CHECK (investment_experience IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
  -- From the doc: "Interested Categories" - stored as JSONB referencing categories
  interested_categories JSONB DEFAULT '[]',
  -- From the doc: Investment Amount and Timeline
  investment_amount NUMERIC(12,2),
  investment_timeline TEXT, -- e.g., "1-3 years", "3-5 years", "5-10 years", "10+ years"
  -- Source tracking
  source TEXT DEFAULT 'welnex-waitlist',
  -- GDPR/Privacy
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);




-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_investment_experience ON waitlist(investment_experience);
CREATE INDEX IF NOT EXISTS idx_waitlist_interested_categories ON waitlist USING GIN (interested_categories);

-- ============================================
-- LEARNING HUB: Learning Paths
-- ============================================
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- e.g., "Beginner", "Intermediate", "Advanced"
  description TEXT,
  -- Order
  order_index INTEGER DEFAULT 0,
  -- Status
  is_active BOOLEAN DEFAULT true,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS learning_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('article', 'video', 'course', 'interactive_module', 'infographic', 'case_study', 'pdf')) NOT NULL,
  -- Rich content metadata
  title_html TEXT, -- HTML version of title
  description TEXT, -- Rich HTML
  -- Media
  video_url TEXT, -- For video content
  pdf_url TEXT, -- For downloadable PDFs
  -- Order within path
  order_index INTEGER DEFAULT 0,
  -- Status
  is_published BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- ============================================
-- User BOOKMARKS/Saves
-- ============================================
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  -- What was bookmarked: investment_listing or learning_content
  bookmarkable_type TEXT CHECK (bookmarkable_type IN ('investment_listing', 'learning_content')) NOT NULL,
  bookmarkable_id UUID NOT NULL,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, bookmarkable_type, bookmarkable_id)
);




-- ============================================
-- SEO METADATA (dynamic per category/listing/provider)
-- ============================================
CREATE TABLE IF NOT EXISTS seo_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- What this metadata is for
  metadata_type TEXT CHECK (metadata_type IN ('category', 'listing', 'provider', 'comparison')) NOT NULL,
  metadata_id UUID NOT NULL, -- ID of the corresponding record
  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  -- Open Graph
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  -- Twitter
  twitter_card TEXT CHECK (twitter_card IN ('summary', 'summary_large_image', 'app')) DEFAULT 'summary',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image_url TEXT,
  -- Canonical URL
  canonical_url TEXT,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- ============================================
-- INDEXES for performance
-- ============================================
-- Investment listings indexes
CREATE INDEX IF NOT EXISTS idx_investment_listings_category ON investment_listings(category_id);
CREATE INDEX IF NOT EXISTS idx_investment_listings_provider ON investment_listings(provider_id);
CREATE INDEX IF NOT EXISTS idx_investment_listings_published ON investment_listings(is_published, is_featured, is_trending);
CREATE INDEX IF NOT EXISTS idx_investment_listings_risk ON investment_listings(risk_level);
CREATE INDEX IF NOT EXISTS idx_investment_listings_liquidity ON investment_listings(liquidity);
CREATE INDEX IF NOT EXISTS idx_investment_listings_minimum ON investment_listings(minimum_investment);
CREATE INDEX IF NOT EXISTS idx_investment_listings_expected_returns ON investment_listings(expected_returns);

-- LMS course indexes
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);

-- Waitlist indexes (already created above)
-- CREATE INDEX idx_waitlist_email ON waitlist(email); -- duplicate, kept for reference

-- Learning content indexes
CREATE INDEX IF NOT EXISTS idx_learning_content_path ON learning_content(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_learning_content_published ON learning_content(is_published);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent ON investment_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_categories_root ON investment_categories(is_root);
CREATE INDEX IF NOT EXISTS idx_categories_active ON investment_categories(is_active);

-- ============================================
-- TRIGGERS for auto-updating timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update trigger for investment_categories
CREATE TRIGGER update_investment_categories_updated_at
BEFORE UPDATE ON investment_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for investment_providers
CREATE TRIGGER update_investment_providers_updated_at
BEFORE UPDATE ON investment_providers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for investment_listings
CREATE TRIGGER update_investment_listings_updated_at
BEFORE UPDATE ON investment_listings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for learning_content
CREATE TRIGGER update_learning_content_updated_at
BEFORE UPDATE ON learning_content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for courses
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for modules
CREATE TRIGGER update_modules_updated_at
BEFORE UPDATE ON modules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for lessons
CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for enrollments
CREATE TRIGGER update_enrollments_updated_at
BEFORE UPDATE ON enrollments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for lesson_progress
CREATE TRIGGER update_lesson_progress_updated_at
BEFORE UPDATE ON lesson_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGERS for auto-updating timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Update trigger for investment_categories
CREATE TRIGGER update_investment_categories_updated_at
BEFORE UPDATE ON investment_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for investment_providers
CREATE TRIGGER update_investment_providers_updated_at
BEFORE UPDATE ON investment_providers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for investment_listings
CREATE TRIGGER update_investment_listings_updated_at
BEFORE UPDATE ON investment_listings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for learning_content
CREATE TRIGGER update_learning_content_updated_at
BEFORE UPDATE ON learning_content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- LMS COURSE MANAGEMENT (Udemy-style course tracker)
-- ============================================

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  -- Status
  is_published BOOLEAN DEFAULT false,
  -- Metadata
  thumbnail_url TEXT,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);




-- Modules table
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  -- Order within course
  order_index INTEGER DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('video', 'pdf', 'text', 'quiz')) NOT NULL,
  content_url TEXT, -- External URL or Supabase storage path
  -- Order within module
  order_index INTEGER DEFAULT 0,
  -- Metadata
  duration_seconds INTEGER DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- Enrollments table - tracks which users enrolled in which courses
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  -- Progress tracking
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  -- Status
  is_completed BOOLEAN DEFAULT false,
  -- Timestamps
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);




-- Lesson Progress table - tracks user progress within each lesson
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  -- Progress
  watched_seconds INTEGER DEFAULT 0,
  -- Status
  is_completed BOOLEAN DEFAULT false,
  -- Timestamps
  last_watched_at TIMESTAMP WITH TIME ZONE,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);




-- Certificates registry - issued when a user completes a course
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  certificate_url TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course ON certificates(course_id);




-- ============================================
-- NOTES/MIGRATION GUIDE
-- ============================================
-- 
-- MIGRATION NOTES:
-- 
-- This schema now supports BOTH the LMS course tracker AND the Alternative Investment Marketplace:
-- 
-- LMS Features (new tables):
-- - courses: Course catalog (Udemy-style)
-- - modules: Course sections/chapters
-- - lessons: Individual lessons within modules
-- - enrollments: User course enrollment + progress tracking
-- - lesson_progress: Per-lesson watching progress
-- 
-- Marketplace Features (existing tables):
-- - investment_categories: Dynamic investment categories/hierarchy
-- - investment_providers: Investment providers/companies
-- - investment_listings: Marketplace investment opportunities
-- - investment_comparisons: Side-by-side comparison tool
-- - waitlist: Waitlist with CRM fields (phone, occupation, etc.)
-- - learning_paths: Learning paths (Beginner/Intermediate/Advanced)
-- - learning_content: Research hub content
-- - seo_metadata: SEO per category/listing/provider
-- - investment_comparisons: Comparison tool
-- 
-- Key distinctions:
-- - Courses/modules/lessons/enrollments = LMS/Udemy course tracker
-- - investment_listings/providers/categories = Alternative Investment Marketplace
-- - Both can coexist; users can both enroll in courses AND browse investments
-- 
-- To apply this schema:
--   1. Go to Supabase Dashboard > SQL Editor
--   2. Run this entire schema file (includes both LMS and marketplace tables)
--   3. Re-apply RLS policies if needed
--   4. Redeploy the application
--
-- To apply this schema:
--   1. Go to Supabase Dashboard > SQL Editor
--   2. Drop existing tables if needed (careful with data!)
--   2. Run this entire schema file
--   3. Re-apply RLS policies
--   4. Redeploy the application

-- ============================================
-- DEFAULT DATA: Initial categories (populate common alt inv categories)
-- ============================================
-- Insert root categories (can have subcategories inserted under them)

INSERT INTO investment_categories (name, is_root, category_type, meta_title, meta_description, order_index) VALUES
  ('REITs', true, 'primary', 'REIT Investments', 'Invest in Real Estate Investment Trusts in India', 0),
  ('InvITs', true, 'primary', 'Infrastructure Investment Trusts', 'Invest in Infrastructure Investment Trusts in India', 1),
  ('AIFs', true, 'primary', 'Alternative Investment Funds', 'Category I, II & III AIFs in India', 2),
  ('PMS', true, 'primary', 'Portfolio Management Services', 'Portfolio Management Solutions', 3),
  ('Private Credit', true, 'primary', 'Private Credit', 'Private credit and loan investments', 4),
  ('Corporate Bonds', true, 'primary', 'Corporate Bonds', 'Corporate bond investments in India', 5),
  ('Infrastructure', true, 'primary', 'Infrastructure Investments', 'Infrastructure sector investments', 6),
  ('Fractional Real Estate', true, 'primary', 'Fractional Real Estate', 'Fractional ownership of real estate', 7),
  ('Commodities', true, 'primary', 'Commodities', 'Gold, Silver and other commodities', 8),
  ('Global Alternatives', true, 'primary', 'Global Alternatives', 'International alternative investment opportunities', 9),
  ('Cryptocurrency (Educational)', true, 'niche', 'Cryptocurrency Education', 'Educational information only - not investment advice', 10);

-- Insert some common subcategories
INSERT INTO investment_categories (name, parent_category_id, is_root, category_type, meta_title, meta_description, order_index) VALUES
  ('SM REITs', (SELECT id FROM investment_categories WHERE name = 'REITs'), false, 'sub', 'SM REITs', 'Small and Medium REITs in India', 0),
  ('Commercial REITs', (SELECT id FROM investment_categories WHERE name = 'REITs'), false, 'sub', 'Commercial REITs', 'Commercial real estate REITs', 1),
  ('InvITs - Power', (SELECT id FROM investment_categories WHERE name = 'InvITs'), false, 'sub', 'Power InvITs', 'Power sector infrastructure InvITs', 0),
  ('InvITs - Road', (SELECT id FROM investment_categories WHERE name = 'InvITs'), false, 'sub', 'Road InvITs', 'Road/highway sector InvITs', 1),
  ('Category I AIF', (SELECT id FROM investment_categories WHERE name = 'AIFs'), false, 'sub', 'Category I AIF', 'Angel funds and social venture funds', 0),
  ('Category II AIF', (SELECT id FROM investment_categories WHERE name = 'AIFs'), false, 'sub', 'Category II AIF', 'Peel funds and other Category II AIFs', 1),
  ('Category III AIF', (SELECT id FROM investment_categories WHERE name = 'AIFs'), false, 'sub', 'Category III AIF', 'Unlisted/other Category III AIFs', 2),
  ('PE Funds', (SELECT id FROM investment_categories WHERE name = 'AIFs'), false, 'sub', 'Private Equity Funds', 'Private equity investment funds', 3),
  ('Hedge Funds', (SELECT id FROM investment_categories WHERE name = 'AIFs'), false, 'sub', 'Hedge Funds', 'Hedge fund structures', 4),
  ('PMS - Discretionary', (SELECT id FROM investment_categories WHERE name = 'PMS'), false, 'sub', 'Discretionary PMS', 'Discretionary portfolio management', 0),
  ('PMS - Non-discretionary', (SELECT id FROM investment_categories WHERE name = 'PMS'), false, 'sub', 'Non-discretionary PMS', 'Non-discretionary portfolio management', 1),
  ('Senior Private Credit', (SELECT id FROM investment_categories WHERE name = 'Private Credit'), false, 'sub', 'Senior Private Credit', 'Senior secured credit', 0),
  ('Mezzanine Credit', (SELECT id FROM investment_categories WHERE name = 'Private Credit'), false, 'sub', 'Mezzanine Credit', 'Mezzanine debt structures', 1),
  ('Infrastructure - Road', (SELECT id FROM investment_categories WHERE name = 'Infrastructure'), false, 'sub', 'Road Infrastructure', 'Road and highway projects', 0),
  ('Infrastructure - Power', (SELECT id FROM investment_categories WHERE name = 'Infrastructure'), false, 'sub', 'Power Infrastructure', 'Power generation and distribution', 1),
  ('Fractional Commercial RE', (SELECT id FROM investment_categories WHERE name = 'Fractional Real Estate'), false, 'sub', 'Fractional Commercial RE', 'Fractional commercial property ownership', 0),
  ('Fractional Residential RE', (SELECT id FROM investment_categories WHERE name = 'Fractional Real Estate'), false, 'sub', 'Fractional Residential RE', 'Fractional residential property ownership', 1),
  ('Physical Gold', (SELECT id FROM investment_categories WHERE name = 'Commodities'), false, 'sub', 'Physical Gold', 'Physical gold investment', 0),
  ('Gold ETFs', (SELECT id FROM investment_categories WHERE name = 'Commodities'), false, 'sub', 'Gold ETFs', 'Gold Exchange Traded Funds', 1),
  ('Silver ETFs', (SELECT id FROM investment_categories WHERE name = 'Commodities'), false, 'sub', 'Silver ETFs', 'Silver Exchange Traded Funds', 2),
  ('Crypto Education', (SELECT id FROM investment_categories WHERE name = 'Cryptocurrency (Educational)'), false, 'sub', 'Crypto Basics', 'Educational cryptocurrency content', 0);

-- ============================================
-- ANNOUNCEMENTS (admin broadcasts)
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CONTACT MESSAGES (support inbox)
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','replied','closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- IDEMPOTENCY CONSTRAINTS for tracking
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_enrollments_user_course
  ON enrollments(user_id, course_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_lesson_progress_enrollment_lesson
  ON lesson_progress(enrollment_id, lesson_id);

-- ============================================
-- CONTACT REPLIES (admin replies to support inbox)
-- ============================================
CREATE TABLE IF NOT EXISTS contact_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES contact_messages(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reply TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
