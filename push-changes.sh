# WelNex — push script
# Run from the project root: /mnt/storage/Projects/WelNex

# Step 1: stage only the application files.
# This deliberately skips .env.production, scratch files, and .commandcode/.

git add \
  SECURITY.md \
  package.json \
  package-lock.json \
  src/app/layout.tsx \
  src/app/waitlist/page.tsx \
  src/app/api/waitlist/route.ts \
  src/app/api/contact/route.ts \
  src/app/api/upload/route.ts \
  src/app/api/webhooks/clerk/route.ts \
  src/app/api/marketplace/ \
  src/app/api/news/ \
  src/app/api/me/ \
  src/app/api/admin/ \
  'src/app/(public)/page.tsx' \
  'src/app/(public)/courses/page.tsx' \
  'src/app/(public)/courses/[courseId]/' \
  'src/app/(admin)/admin/page.tsx' \
  'src/app/(admin)/admin/AdminLayoutClient.tsx' \
  'src/app/(admin)/admin/certificates/page.tsx' \
  'src/app/(admin)/admin/courses/page.tsx' \
  'src/app/(admin)/admin/courses/new/page.tsx' \
  'src/app/(admin)/admin/courses/actions.ts' \
  'src/app/(admin)/admin/categories/' \
  'src/app/(admin)/admin/listings/' \
  'src/app/(admin)/admin/users/page.tsx' \
  'src/app/(admin)/admin/users/actions.ts' \
  'src/app/(admin)/admin/users/[userId]/' \
  'src/app/(admin)/admin/waitlist/' \
  'src/app/(admin)/admin/WaitlistChart.tsx' \
  src/app/student-portal/dashboard/page.tsx \
  src/app/student-portal/actions.ts \
  src/app/student-portal/announcements/page.tsx \
  'src/app/listing/[id]/' \
  src/components/public/WaitlistForm.tsx \
  src/components/learn/XPProgress.tsx \
  src/components/learn/InvestmentsCard.tsx \
  src/components/admin/CourseActions.tsx \
  src/components/admin/CurriculumBuilder.tsx \
  src/components/ui/StorageUploader.tsx \
  src/components/ui/DisclaimerPopup.tsx \
  src/components/ui/CookieConsent.tsx \
  src/components/ui/SafeHtml.tsx \
  src/components/marketplace/ \
  src/components/discover/ \
  src/lib/ensure-supabase-user.ts \
  src/lib/env-validation.ts \
  src/lib/listing-utils.ts \
  src/lib/marketplace.ts \
  src/lib/news.ts \
  src/lib/news-categories.ts \
  src/lib/levels.ts \
  src/lib/admin-guard.ts \
  src/middleware.ts \
  supabase/schema.sql \
  supabase/security-policies.sql

# Step 2: confirm what's staged, and double-check no secrets are included.

git status --short
git diff --cached --name-only | grep -E '\.env$|secret|token' || echo "OK: no secret files staged"

# Step 3: commit with a detailed message.

git commit -F - <<'MSG'
feat: full system audit, tracking, asset details, admin, waitlist, contact fixes

BREAKING (schema): adds xp/level to users, announcements, contact_messages,
contact_replies, idempotency indexes on enrollments/lesson_progress. Run
supabase/schema.sql then supabase/security-policies.sql.

Features
- Asset Details page (/listing/[id]) with 5-metric row, overview, strategy,
  underlying, risk, three primary actions (Access Through Partner, Add to
  Compare, Join Waitlist), educational content link, and Recent News
  reusing /api/news.
- Course Details page (/courses/[courseId]) with enroll, per-lesson
  mark-complete, real progress bars.
- Student dashboard rewritten to bucket courses into In Progress / Pending /
  Completed; XP and Level now read from DB.
- Admin pages backed by real Supabase data: waitlist (with CSV export),
  listings (+ /new and /[id]), categories (create/toggle/delete), users
  (detail page with role form and XP adjust).
- Cookie consent banner + persistent investment disclaimer, both
  localStorage-backed and one-shot per visitor.

Fixes
- ensureSupabaseUser: writes 'user' role, not 'student' (was rejected by
  schema CHECK).
- /api/waitlist: removed non-existent 'age' column; new 409 on duplicate
  email; only valid columns.
- WaitlistForm: matches the API; localStorage 'already submitted' state.
- /waitlist page: removed service-role key leak to the browser.
- /api/contact: status 'open' (was 'pending', rejected by schema);
  lazy-init transporter.
- /api/webhooks/clerk: 'user' role (was 'student'); upsert fallback on
  23505 race with ensureSupabaseUser.
- /api/upload: bucket names match what exists in Supabase
  (course-thumbnails, lesson-content).
- Admin dashboard: drop non-existent waitlist.role select.
- Student dashboard: real progress from enrollments.progress_percent.
- Admin role update: whitelist of valid roles.

Schema / RLS
- schema.sql is now tables only.
- security-policies.sql is the single source of truth for RLS, fully
  idempotent (every CREATE POLICY is paired with a matching
  DROP POLICY IF EXISTS).

Refs (cleanup)
- Deleted: src/app/marketpage-page.tsx.backup
- Added shared: src/lib/levels.ts, src/lib/admin-guard.ts

Co-authored-by: CommandCodeBot <noreply@commandcode.ai>
MSG

# Step 4: push to origin/main. Vercel will auto-deploy from the Git-connected repo.

git push origin main
