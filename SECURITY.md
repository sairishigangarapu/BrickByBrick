# Security Documentation

## 🔒 Security Measures Implemented

### 1. **Row Level Security (RLS)**
All Supabase tables have RLS enabled with strict policies:
- ✅ Students can only see published courses
- ✅ Students can only modify their own progress
- ✅ Admins have full access to manage content
- ✅ No unauthorized data access possible

**To apply RLS policies:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/security-policies.sql`
3. Run the SQL script

### 2. **Authentication & Authorization**
- ✅ Clerk handles all authentication
- ✅ Server-side auth checks on all protected routes
- ✅ Role-based access control (admin vs student)
- ✅ JWT tokens validated on every request

### 3. **Data Access Patterns**
- ✅ Server-side rendering for sensitive data
- ✅ Service role key only used server-side
- ✅ Client-side uses anonymous key (limited access)
- ✅ No direct database access from client

### 4. **API Security**
- ✅ All admin actions require authentication
- ✅ Server actions validate user roles
- ✅ No debug/diagnostic endpoints in production
- ✅ Error messages don't expose sensitive info

### 5. **Storage Security**
- ✅ Public read access for course content (required for viewing)
- ✅ Admin-only write access
- ✅ File uploads validated and sanitized
- ✅ Storage buckets properly configured

## 🚫 What's Protected

### Cannot Be Accessed Without Auth:
- User profiles and personal data
- Lesson progress and completion status
- Contact messages
- Admin panel and all admin functions
- Unpublished courses

### Public Access (By Design):
- Published courses and lessons
- Course thumbnails
- PDF/video content (must be public for viewing)
- Waitlist signup

## 🔐 Environment Variables

### Required Variables:
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional
CLERK_WEBHOOK_SECRET=whsec_...
UPLOADTHING_TOKEN=eyJ...
```

### Security Rules:
- ❌ Never commit `.env.local` to git
- ❌ Never expose service role key to client
- ❌ Never log sensitive data in production
- ✅ Use different keys for dev/staging/production

## 🛡️ Best Practices

### For Admins:
1. **Never share admin credentials**
2. **Use strong passwords** (Clerk enforces this)
3. **Review user roles** regularly
4. **Monitor access logs** in Supabase dashboard
5. **Keep dependencies updated**

### For Developers:
1. **Always use server actions** for data mutations
2. **Validate all user input** before database operations
3. **Use TypeScript** for type safety
4. **Test RLS policies** before deploying
5. **Never disable RLS** on production tables

## 🔍 Security Checklist

Before deploying to production:

- [ ] RLS policies applied to all tables
- [ ] Environment variables set correctly
- [ ] No console.log statements with sensitive data
- [ ] Debug routes removed
- [ ] Admin panel requires authentication
- [ ] File upload size limits configured
- [ ] CORS properly configured
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Clerk production keys configured
- [ ] Supabase production database used

## 🚨 What to Do If Compromised

If you suspect a security breach:

1. **Immediately rotate all keys:**
   - Regenerate Clerk keys
   - Regenerate Supabase keys
   - Update environment variables

2. **Check Supabase logs:**
   - Go to Dashboard → Logs
   - Look for suspicious queries
   - Check for unauthorized access

3. **Review user accounts:**
   - Check for unauthorized admin accounts
   - Review recent signups

4. **Update RLS policies:**
   - Make them more restrictive if needed
   - Test thoroughly

## 📊 Monitoring

### What to Monitor:
- Failed authentication attempts (Clerk dashboard)
- Database query patterns (Supabase logs)
- Storage usage and access patterns
- API error rates
- Unusual admin activity

### Tools:
- **Clerk Dashboard**: User activity, auth logs
- **Supabase Dashboard**: Database logs, API usage
- **Vercel Analytics**: Traffic patterns, errors

## ✅ Current Security Status

- ✅ All console logs removed from production code
- ✅ Debug routes deleted
- ✅ RLS policies documented and ready to apply
- ✅ Server-side rendering for sensitive data
- ✅ Proper authentication on all protected routes
- ✅ Environment validation implemented
- ✅ No sensitive data exposed to client

## 📝 Notes

1. **PDF/Video URLs are public** - This is required for the browser to load them. They're stored in Supabase Storage with public read access.

2. **Course content is public once published** - This is by design. Unpublished courses are protected.

3. **User progress is private** - Only the user and admins can see individual progress.

4. **Admin actions are logged** - Supabase logs all database operations for audit purposes.
