-- ============================================
-- SECURITY POLICIES FOR BRICKBYBRICK LMS
-- ============================================
-- Run these in your Supabase SQL Editor to secure your database

-- ============================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. USERS TABLE POLICIES
-- ============================================

-- Users can read their own data
CREATE POLICY "Users can read own data"
ON users FOR SELECT
TO authenticated
USING (clerk_id = auth.jwt() ->> 'sub');

-- Admins can read all users
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

-- ============================================
-- 3. COURSES TABLE POLICIES
-- ============================================

-- Anyone can read published courses
CREATE POLICY "Anyone can read published courses"
ON courses FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- Admins can read all courses
CREATE POLICY "Admins can read all courses"
ON courses FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- Admins can insert/update/delete courses
CREATE POLICY "Admins can manage courses"
ON courses FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 4. MODULES TABLE POLICIES
-- ============================================

-- Anyone can read modules of published courses
CREATE POLICY "Anyone can read modules of published courses"
ON modules FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = modules.course_id
    AND courses.is_published = true
  )
);

-- Admins can manage all modules
CREATE POLICY "Admins can manage modules"
ON modules FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 5. LESSONS TABLE POLICIES
-- ============================================

-- Anyone can read lessons of published courses
CREATE POLICY "Anyone can read lessons of published courses"
ON lessons FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM modules
    JOIN courses ON courses.id = modules.course_id
    WHERE modules.id = lessons.module_id
    AND courses.is_published = true
  )
);

-- Admins can manage all lessons
CREATE POLICY "Admins can manage lessons"
ON lessons FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 6. ENROLLMENTS TABLE POLICIES
-- ============================================

-- Users can read their own enrollments
CREATE POLICY "Users can read own enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

-- Admins can read all enrollments
CREATE POLICY "Admins can read all enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 7. LESSON PROGRESS TABLE POLICIES
-- ============================================

-- Users can read their own progress
CREATE POLICY "Users can read own progress"
ON lesson_progress FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
ON lesson_progress FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

CREATE POLICY "Users can modify own progress"
ON lesson_progress FOR UPDATE
TO authenticated
USING (
  user_id IN (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

-- Admins can read all progress
CREATE POLICY "Admins can read all progress"
ON lesson_progress FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 8. ANNOUNCEMENTS TABLE POLICIES
-- ============================================

-- Anyone can read announcements
CREATE POLICY "Anyone can read announcements"
ON announcements FOR SELECT
TO anon, authenticated
USING (true);

-- Admins can manage announcements
CREATE POLICY "Admins can manage announcements"
ON announcements FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 9. CONTACT MESSAGES TABLE POLICIES
-- ============================================

-- Users can read their own messages
CREATE POLICY "Users can read own messages"
ON contact_messages FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

-- Users can create messages
CREATE POLICY "Users can create messages"
ON contact_messages FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

-- Admins can read all messages
CREATE POLICY "Admins can read all messages"
ON contact_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- Admins can update messages
CREATE POLICY "Admins can update messages"
ON contact_messages FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 10. CONTACT REPLIES TABLE POLICIES
-- ============================================

-- Users can read replies to their messages
CREATE POLICY "Users can read replies to own messages"
ON contact_replies FOR SELECT
TO authenticated
USING (
  message_id IN (
    SELECT id FROM contact_messages
    WHERE user_id IN (
      SELECT id FROM users
      WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  )
);

-- Admins can manage all replies
CREATE POLICY "Admins can manage replies"
ON contact_replies FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 11. CERTIFICATES TABLE POLICIES
-- ============================================

-- Users can read their own certificates
CREATE POLICY "Users can read own certificates"
ON certificates FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

-- Admins can manage all certificates
CREATE POLICY "Admins can manage certificates"
ON certificates FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- ============================================
-- 12. WAITLIST TABLE POLICIES
-- ============================================

-- Anyone can insert into waitlist
CREATE POLICY "Anyone can join waitlist"
ON waitlist FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admins can read waitlist
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

-- ============================================
-- 13. STORAGE BUCKET POLICIES
-- ============================================

-- Course thumbnails: Public read, admin write
CREATE POLICY "Public can view course thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-thumbnails');

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

-- Admins can update course thumbnails
CREATE POLICY "Admins can update course thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-thumbnails'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- Admins can delete course thumbnails
CREATE POLICY "Admins can delete course thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-thumbnails'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- Lesson content: Public read, admin write
CREATE POLICY "Public can view lesson content"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lesson-content');

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

-- Admins can update lesson content
CREATE POLICY "Admins can update lesson content"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'lesson-content'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- Admins can delete lesson content
CREATE POLICY "Admins can delete lesson content"
ON storage.objects FOR DELETE
TO authenticated
USING (
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
-- 1. These policies ensure that:
--    - Only admins can create/edit courses and lessons
--    - Students can only see published courses
--    - Students can only modify their own progress
--    - No one can access other users' data
--
-- 2. To apply these policies:
--    - Go to Supabase Dashboard > SQL Editor
--    - Copy and paste this entire file
--    - Click "Run"
--
-- 3. To verify policies are working:
--    - Try accessing data from the client without auth
--    - Should only see published courses
--    - Should not see other users' progress
