-- ============================================
-- SECURITY POLICIES FOR WELNEX
-- ============================================
-- Run this in your Supabase SQL Editor AFTER running schema.sql.
-- This file is idempotent: every CREATE POLICY is preceded by a matching
-- DROP POLICY IF EXISTS on the same name, so re-running is safe.
--
-- Tables covered (must exist before this file is run):
--   users, investment_categories, investment_providers, investment_listings,
--   investment_comparisons, waitlist, learning_paths, learning_content,
--   user_bookmarks, seo_metadata, courses, modules, lessons, enrollments,
--   lesson_progress, announcements, contact_messages, contact_replies
--
-- Storage buckets covered:
--   course-thumbnails, lesson-content

-- ============================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_replies ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. USERS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
ON users FOR SELECT
TO authenticated
USING (clerk_id = auth.jwt() ->> 'sub');

DROP POLICY IF EXISTS "Admins can read all users" ON users;
CREATE POLICY "Admins can read all users"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Investment providers can read own data" ON users;
CREATE POLICY "Investment providers can read own data"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'investment_provider'
  )
);

-- ============================================
-- 3. INVESTMENT CATEGORIES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active categories" ON investment_categories;
CREATE POLICY "Anyone can view active categories"
ON investment_categories FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage categories" ON investment_categories;
CREATE POLICY "Admins can manage categories"
ON investment_categories FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 4. INVESTMENT PROVIDERS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active providers" ON investment_providers;
CREATE POLICY "Anyone can view active providers"
ON investment_providers FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage providers" ON investment_providers;
CREATE POLICY "Admins can manage providers"
ON investment_providers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 5. INVESTMENT LISTINGS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view published listings" ON investment_listings;
CREATE POLICY "Anyone can view published listings"
ON investment_listings FOR SELECT
TO anon, authenticated
USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage listings" ON investment_listings;
CREATE POLICY "Admins can manage listings"
ON investment_listings FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 6. INVESTMENT COMPARISONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view comparisons" ON investment_comparisons;
CREATE POLICY "Anyone can view comparisons"
ON investment_comparisons FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage comparisons" ON investment_comparisons;
CREATE POLICY "Admins can manage comparisons"
ON investment_comparisons FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 7. WAITLIST TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
CREATE POLICY "Anyone can join waitlist"
ON waitlist FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read waitlist" ON waitlist;
CREATE POLICY "Admins can read waitlist"
ON waitlist FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can read own waitlist entry" ON waitlist;
CREATE POLICY "Users can read own waitlist entry"
ON waitlist FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND email = waitlist.email
  )
);

-- ============================================
-- 8. LEARNING PATHS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active learning paths" ON learning_paths;
CREATE POLICY "Anyone can view active learning paths"
ON learning_paths FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage learning paths" ON learning_paths;
CREATE POLICY "Admins can manage learning paths"
ON learning_paths FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 9. LEARNING CONTENT TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view published learning content" ON learning_content;
CREATE POLICY "Anyone can view published learning content"
ON learning_content FOR SELECT
TO anon, authenticated
USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage learning content" ON learning_content;
CREATE POLICY "Admins can manage learning content"
ON learning_content FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 10. USER BOOKMARKS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can read own bookmarks" ON user_bookmarks;
CREATE POLICY "Users can read own bookmarks"
ON user_bookmarks FOR SELECT
TO authenticated
USING (
  user_id = (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

DROP POLICY IF EXISTS "Users can manage own bookmarks" ON user_bookmarks;
CREATE POLICY "Users can manage own bookmarks"
ON user_bookmarks FOR ALL
TO authenticated
USING (
  user_id = (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
)
WITH CHECK (
  user_id = (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

DROP POLICY IF EXISTS "Admins can manage bookmarks" ON user_bookmarks;
CREATE POLICY "Admins can manage bookmarks"
ON user_bookmarks FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 11. SEO METADATA TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view SEO metadata" ON seo_metadata;
CREATE POLICY "Anyone can view SEO metadata"
ON seo_metadata FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage SEO metadata" ON seo_metadata;
CREATE POLICY "Admins can manage SEO metadata"
ON seo_metadata FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 12. COURSES / MODULES / LESSONS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
CREATE POLICY "Anyone can view published courses"
ON courses FOR SELECT
TO anon, authenticated
USING (is_published = true);

DROP POLICY IF EXISTS "Instructors can manage own courses" ON courses;
CREATE POLICY "Instructors can manage own courses"
ON courses FOR ALL
TO authenticated
USING (
  instructor_id = (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
  OR EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
)
WITH CHECK (
  instructor_id = (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
  OR EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Anyone can view modules in published courses" ON modules;
CREATE POLICY "Anyone can view modules in published courses"
ON modules FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = modules.course_id
    AND courses.is_published = true
  )
);

DROP POLICY IF EXISTS "Course owners can manage modules" ON modules;
CREATE POLICY "Course owners can manage modules"
ON modules FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = modules.course_id
    AND (
      courses.instructor_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub')
      OR EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.jwt() ->> 'sub' AND role = 'admin')
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = modules.course_id
    AND (
      courses.instructor_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub')
      OR EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.jwt() ->> 'sub' AND role = 'admin')
    )
  )
);

DROP POLICY IF EXISTS "Anyone can view published lessons" ON lessons;
CREATE POLICY "Anyone can view published lessons"
ON lessons FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = lessons.course_id
    AND courses.is_published = true
  )
);

DROP POLICY IF EXISTS "Course owners can manage lessons" ON lessons;
CREATE POLICY "Course owners can manage lessons"
ON lessons FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = lessons.course_id
    AND (
      courses.instructor_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub')
      OR EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.jwt() ->> 'sub' AND role = 'admin')
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = lessons.course_id
    AND (
      courses.instructor_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub')
      OR EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.jwt() ->> 'sub' AND role = 'admin')
    )
  )
);

-- ============================================
-- 13. ENROLLMENTS / LESSON PROGRESS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can read own enrollments" ON enrollments;
CREATE POLICY "Users can read own enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (
  user_id = (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

DROP POLICY IF EXISTS "Users can manage own enrollments" ON enrollments;
CREATE POLICY "Users can manage own enrollments"
ON enrollments FOR ALL
TO authenticated
USING (
  user_id = (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
)
WITH CHECK (
  user_id = (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

DROP POLICY IF EXISTS "Admins can manage enrollments" ON enrollments;
CREATE POLICY "Admins can manage enrollments"
ON enrollments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can read own progress" ON lesson_progress;
CREATE POLICY "Users can read own progress"
ON lesson_progress FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.id = lesson_progress.enrollment_id
    AND enrollments.user_id = (
      SELECT id FROM users
      WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  )
);

DROP POLICY IF EXISTS "Users can manage own progress" ON lesson_progress;
CREATE POLICY "Users can manage own progress"
ON lesson_progress FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.id = lesson_progress.enrollment_id
    AND enrollments.user_id = (
      SELECT id FROM users
      WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.id = lesson_progress.enrollment_id
    AND enrollments.user_id = (
      SELECT id FROM users
      WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  )
);

DROP POLICY IF EXISTS "Admins can manage progress" ON lesson_progress;
CREATE POLICY "Admins can manage progress"
ON lesson_progress FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 14. ANNOUNCEMENTS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can read announcements" ON announcements;
CREATE POLICY "Anyone can read announcements"
ON announcements FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
CREATE POLICY "Admins can manage announcements"
ON announcements FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 15. CONTACT MESSAGES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can read own contact messages" ON contact_messages;
CREATE POLICY "Users can read own contact messages"
ON contact_messages FOR SELECT
TO authenticated
USING (
  user_id = (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

DROP POLICY IF EXISTS "Users can create contact messages" ON contact_messages;
CREATE POLICY "Users can create contact messages"
ON contact_messages FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

DROP POLICY IF EXISTS "Admins can manage contact messages" ON contact_messages;
CREATE POLICY "Admins can manage contact messages"
ON contact_messages FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 16. CONTACT REPLIES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can read replies to their own messages" ON contact_replies;
CREATE POLICY "Users can read replies to their own messages"
ON contact_replies FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM contact_messages
    WHERE contact_messages.id = contact_replies.message_id
    AND contact_messages.user_id = (
      SELECT id FROM users
      WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  )
);

DROP POLICY IF EXISTS "Admins can manage contact replies" ON contact_replies;
CREATE POLICY "Admins can manage contact replies"
ON contact_replies FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 17. STORAGE BUCKET POLICIES
-- ============================================

-- Storage buckets: course-thumbnails and lesson-content (both public).
-- Add more buckets here if you create them.

DROP POLICY IF EXISTS "Public can view course thumbnails" ON storage.objects;
CREATE POLICY "Public can view course thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-thumbnails');

DROP POLICY IF EXISTS "Admins can upload course thumbnails" ON storage.objects;
CREATE POLICY "Admins can upload course thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-thumbnails'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Public can view lesson content" ON storage.objects;
CREATE POLICY "Public can view lesson content"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lesson-content');

DROP POLICY IF EXISTS "Admins can upload lesson content" ON storage.objects;
CREATE POLICY "Admins can upload lesson content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-content'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- NOTES:
-- ============================================
-- 1. Run supabase/schema.sql FIRST, then this file.
-- 2. Safe to re-run: every CREATE POLICY is paired with a matching DROP.
-- 3. All admin policies check Clerk JWT 'sub' claim against users.clerk_id.
-- 4. Storage bucket names assumed:
--    - course-thumbnails: for course thumbnails and listing imagery
--    - lesson-content: for lesson videos, PDFs, brochures, and downloads
