# Security Deployment Checklist

## ✅ Completed Security Measures

### Code Cleanup
- [x] All `console.log` statements removed from production code
- [x] All `console.error` statements removed from production code
- [x] All `console.warn` statements removed from production code
- [x] Debug API routes deleted (`/api/check-storage`, `/api/fix-lessons`)
- [x] Debug admin routes deleted (`/admin/fix-lessons`)

### Security Documentation
- [x] RLS policies documented in `supabase/security-policies.sql`
- [x] Security guide created in `SECURITY.md`
- [x] Environment validation implemented in `src/lib/env-validation.ts`

### Code Security
- [x] Server-side rendering for sensitive data
- [x] Service role key only used server-side (never exposed to client)
- [x] Authentication checks on all protected routes
- [x] Role-based access control implemented

## 🔴 CRITICAL: Apply RLS Policies

**You MUST complete this step before going to production:**

1. Open your Supabase Dashboard
2. Navigate to: **SQL Editor**
3. Copy the entire contents of `supabase/security-policies.sql`
4. Paste into the SQL Editor
5. Click **Run**
6. Verify no errors appear

**What this does:**
- Enables Row Level Security on all tables
- Prevents students from seeing unpublished courses
- Prevents users from accessing other users' data
- Restricts admin operations to admin users only
- Secures storage buckets

## 🧪 Testing Your Security

After applying RLS policies, test these scenarios:

### Test 1: Unauthenticated Access
```bash
# Open browser in incognito mode
# Navigate to: http://localhost:3000
# Expected: Can only see published courses
# Expected: Cannot access /admin or /student-portal
```

### Test 2: Student Access
```bash
# Sign in as a student (non-admin)
# Try to access: /admin
# Expected: Redirected or access denied
# Expected: Can only see own progress
# Expected: Can only see published courses
```

### Test 3: Admin Access
```bash
# Sign in as admin
# Expected: Full access to /admin panel
# Expected: Can see all users and their progress
# Expected: Can create/edit courses
```

### Test 4: Data Isolation
```bash
# Sign in as Student A
# Note your progress data
# Sign out, sign in as Student B
# Expected: Cannot see Student A's progress
# Expected: Only see own enrollments and progress
```

## 🔐 Environment Variables Check

Verify these are set in production:

### Vercel Dashboard → Settings → Environment Variables

```bash
# Clerk (Production Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...  # NOT pk_test_
CLERK_SECRET_KEY=sk_live_...                    # NOT sk_test_

# Supabase (Production Database)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional but Recommended
CLERK_WEBHOOK_SECRET=whsec_...
```

**⚠️ NEVER use development keys in production!**

## 🚨 Pre-Deployment Checklist

Before deploying to production:

- [ ] RLS policies applied in Supabase
- [ ] Production environment variables set in Vercel
- [ ] Clerk production keys configured
- [ ] Supabase production database selected
- [ ] All security tests passed
- [ ] No console logs in code
- [ ] Debug routes removed
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Admin account created and tested
- [ ] Student account created and tested

## 📊 Post-Deployment Monitoring

After deployment, monitor:

1. **Clerk Dashboard**
   - Watch for failed login attempts
   - Monitor user signups
   - Check for unusual activity

2. **Supabase Dashboard**
   - Review database logs
   - Check API usage patterns
   - Monitor storage usage

3. **Vercel Dashboard**
   - Check error rates
   - Monitor function execution times
   - Review deployment logs

## 🔄 Regular Maintenance

### Weekly
- [ ] Review Supabase logs for errors
- [ ] Check Clerk dashboard for suspicious activity
- [ ] Monitor storage usage

### Monthly
- [ ] Update dependencies (`npm update`)
- [ ] Review and update RLS policies if needed
- [ ] Audit admin user accounts
- [ ] Check for security updates

### Quarterly
- [ ] Rotate API keys (if compromised)
- [ ] Review all user roles
- [ ] Security audit of new features
- [ ] Update security documentation

## 🆘 Emergency Response

If you suspect a security breach:

1. **Immediately:**
   - Disable compromised accounts in Clerk
   - Check Supabase logs for unauthorized queries
   - Review recent admin activity

2. **Within 1 hour:**
   - Rotate all API keys (Clerk + Supabase)
   - Update environment variables
   - Force re-deploy application

3. **Within 24 hours:**
   - Audit all user accounts
   - Review RLS policies
   - Notify affected users if needed
   - Document the incident

## 📞 Support Resources

- **Clerk Support**: https://clerk.com/support
- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/support

## ✅ Current Status

**Last Updated:** June 1, 2026

- ✅ All console logs removed
- ✅ Debug routes deleted
- ✅ RLS policies documented
- ✅ Security guide created
- ⏳ **PENDING: Apply RLS policies in Supabase**
- ⏳ **PENDING: Set production environment variables**
- ⏳ **PENDING: Test security measures**

---

**Remember:** Security is not a one-time task. Regular monitoring and updates are essential to keep your application secure.
