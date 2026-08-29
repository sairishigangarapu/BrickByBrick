# Security Documentation

## 🔒 Security Measures Implemented

### 1. **Row Level Security (RLS)**
All Supabase tables have RLS enabled with strict policies:
- ✅ Users can only see their own data (profile, progress, bookmarks, waitlist)
- ✅ Students/users can only see published investment listings
- ✅ Investment providers can only manage their own listings
- ✅ Admins have full access to manage content and users
- ✅ No unauthorized data access possible

**To apply RLS policies:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/security-policies.sql`
3. Run the SQL script

### 2. **Authentication & Authorization**
- ✅ Clerk handles all authentication
- ✅ Server-side auth checks on all protected routes
- ✅ Role-based access control (user/admin/investment_provider/accredited_investor)
- ✅ JWT tokens validated on every request
- ✅ No debug/diagnostic endpoints accessible in production

### 3. **Data Access Patterns**
- ✅ Server-side rendering for sensitive data
- ✅ Service role key only used server-side (never exposed to client)
- ✅ Client-side uses anonymous key (limited access via RLS)
- ✅ No direct database access from client components

### 4. **API Security**
- ✅ All admin actions require authentication
- ✅ Server actions validate user roles
- ✅ No debug/diagnostic endpoints in production
- ✅ Error messages don't leak sensitive info
- ✅ All API responses sanitized

### 5. **Storage Security**
- ✅ Public read for investment content (required for viewing)
- ✅ Admin-only write access
- ✅ File uploads validated and sanitized (type, size, MIME)
- ✅ Storage buckets properly configured with RLS
- ✅ Bucket policies: investment-logos, investment-banners, learning-pdfs, brochures

### 6. **Environment Variable Security**
- ✅ Never commit `.env.local` to git
- ✅ Use different keys for dev/staging/production
- ✅ All required env vars validated on startup
- ✅ Production keys (pk_live_, sk_live_) not development keys

## 🚫 What's Protected

### Cannot Be Accessed Without Auth:
- User profiles and personal data
- Investment progress and saved listings
- Bookmarked investments
- Waitlist entries (own only)
- Admin panel and all admin functions
- Unpublished investment listings
- Other users' data and bookmarks

### Public Access (By Design):
- Published investment listings
- Investment category pages
- Learning hub content (when published)
- Marketplace browse page
- Homepage and public pages
- Calculators (all public)

## 🔐 Environment Variables

### Required Variables:
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional but Recommended
CLERK_WEBHOOK_SECRET=whsec_...
```

### Security Rules:
- ❌ Never commit `.env.local` to git
- ❌ Never expose service role key to client
- ❌ Never log sensitive data in production
- ✅ Use different keys for dev/staging/production
- ✅ Validate all environment variables on startup

## 🛡️ Best Practices

### For All Users:
1. **Never share authentication credentials**
2. **Use strong passwords** (Clerk enforces this)
3. **Review account activity** regularly
4. **Report suspicious activity** immediately
5. **Keep browser and apps updated**

### For Developers:
1. **Always use server actions** for data mutations
2. **Validate all user input** before database operations
3. **Use TypeScript** for type safety
4. **Test RLS policies** before deploying
5. **Never disable RLS** on production tables
6. ✅ **Sanitize all rich text content** before storage
7. ✅ **Validate file uploads** (type, size, content)
8. ✅ **Use server-side rendering** for sensitive data

### For Admins:
1. **Never share admin credentials**
2. **Review user roles** regularly
3. **Monitor access logs** in Supabase/dashboard
4. **Keep dependencies updated**
5. **Review RLS policies** quarterly
6. **Rotate API keys** if compromised

## 🔍 Security Checklist

Before deploying to production:

- [ ] RLS policies applied to all tables
- [ ] Environment variables set correctly (in Vercel, not repo)
- [ ] No console.log statements with sensitive data
- [ ] Debug routes removed
- [ ] Admin panel requires authentication
- [ ] File upload size limits configured
- [ ] CORS properly configured
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Clerk production keys configured
- [ ] Supabase production database selected
- [ ] All security tests passed
- [ ] No console logs in code
- [ ] Data isolation between users verified
- [ ] SEO metadata generated for key pages

## 🚨 What to Do If Compromised

If you suspect a security breach:

1. **Immediately:**
   - Rotate all keys:
     - Regenerate Clerk keys
     - Regenerate Supabase keys
     - Update environment variables
   - Check Supabase logs for suspicious queries
   - Review recent admin activity

2. **Check what was exposed:**
   - User data (check Supabase logs)
   - Investment listings access patterns
   - Waitlist entry access
   - Bookmark access patterns

3. **Update security measures:**
   - Make RLS policies more restrictive if needed
   - Test thoroughly
   - Deploy fixes immediately

## 📊 Monitoring

### What to Monitor:
- Failed authentication attempts (Clerk dashboard)
- Database query patterns (Supabase logs)
- Storage usage and access patterns
- API error rates
- Unusual admin activity

### Tools:
- **Clerk Dashboard**: User activity, auth logs
- **Supabase Dashboard**: Database logs, API usage, storage metrics
- **Vercel Analytics**: Traffic patterns, errors

## ✅ Current Security Status

- ✅ All console logs removed from production code
- ✅ Debug routes deleted
- ✅ RLS policies documented and ready to apply
- ✅ Security guide created (OWASP_MITRE_SECURITY_GUIDE.md)
- ✅ Server-side rendering for sensitive data
- ✅ Proper authentication on all protected routes
- ✅ Environment validation implemented
- ✅ No sensitive data exposed to client
- ✅ File upload validation configured
- ✅ RBAC defined for 4 roles: user, admin, investment_provider, accredited_investor
- ✅ File bucket policies configured

## 📝 Notes

1. **Investment listing URLs are public** - This is required for the browser to load them. They're stored in Supabase Storage with public read access and RLS enforcement.

2. **Course/investment content is public once published** - This is by design. Unpublished courses/listings are protected.

3. **User progress and bookmarks are private** - Only the user and admins can see individual progress and bookmarks.

4. **Admin actions are logged** - Supabase logs all database operations for audit purposes.

5. **Never use development keys in production** - Always use pk_live_ and sk_live_ for production deployment.

6. **Row Level Security is mandatory** - Never disable RLS on any table in production.

7. **Service role key never exposed to client** - All server-side only, including database migrations and admin operations.