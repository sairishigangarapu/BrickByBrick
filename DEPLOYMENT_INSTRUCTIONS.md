# 🚀 Quick Deployment Instructions

Your code is now on GitHub and ready to deploy!

## ✅ What's Done

- ✅ All code pushed to: https://github.com/sairishigangarapu/BrickByBrick.git
- ✅ Security hardening complete (no console logs, debug routes removed)
- ✅ RLS policies documented and ready to apply
- ✅ Comprehensive documentation created
- ✅ .env files properly ignored

## 🎯 Deploy to Vercel (5 Minutes)

### 1. Import Project to Vercel

Go to: https://vercel.com/new

1. Click **"Import Git Repository"**
2. Select: `sairishigangarapu/BrickByBrick`
3. Click **"Import"**

### 2. Add Environment Variables

In Vercel, add these environment variables:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Important:** Use PRODUCTION keys (pk_live_, sk_live_), not development keys!

### 3. Deploy

Click **"Deploy"** and wait 2-3 minutes.

### 4. Apply RLS Policies (CRITICAL!)

**You MUST do this before users can access your site:**

1. Go to: https://supabase.com/dashboard
2. Select your production project
3. Click **SQL Editor**
4. Copy contents of `supabase/security-policies.sql`
5. Paste and click **"Run"**

This enables all security policies and protects your data.

### 5. Configure Clerk

1. Go to: https://dashboard.clerk.com
2. Add your Vercel domain to allowed domains
3. Set up webhook: `https://your-site.vercel.app/api/webhooks/clerk`
4. Subscribe to: `user.created`, `user.updated`, `user.deleted`

### 6. Test Your Site

- Visit your Vercel URL
- Sign up as a student
- Test course access
- Create an admin account (set role in Supabase)
- Test admin panel

## 📚 Documentation

- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Detailed deployment guide
- **[SECURITY.md](./SECURITY.md)** - Security documentation
- **[SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)** - Pre-deployment checklist
- **[TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)** - Common issues

## 🔗 Important Links

- **GitHub Repo**: https://github.com/sairishigangarapu/BrickByBrick.git
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Clerk Dashboard**: https://dashboard.clerk.com

## ⚠️ Before Going Live

Make sure you:

1. ✅ Applied RLS policies in Supabase
2. ✅ Set production environment variables
3. ✅ Configured Clerk webhooks
4. ✅ Tested all user roles
5. ✅ Verified data security

## 🆘 Need Help?

Check the documentation files above or review:
- Vercel build logs for deployment issues
- Supabase logs for database errors
- Clerk dashboard for auth issues

---

**You're all set!** Follow the steps above to deploy your LMS to production. 🎉
