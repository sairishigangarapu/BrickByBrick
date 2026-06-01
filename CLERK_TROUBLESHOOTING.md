# Clerk Sign-In/Sign-Up Not Rendering - Troubleshooting

## The Problem
You're seeing this error in the console:
```
Clerk: Refreshing the session token resulted in an infinite redirect loop. 
This usually means that your Clerk instance keys do not match.
```

## Root Cause
Your Clerk publishable key and secret key don't match or are invalid.

## Solution Steps

### 1. Go to Your Clerk Dashboard
Visit: https://dashboard.clerk.com/

### 2. Select Your Application
- Click on your application (should be "shining-caribou-4" based on your key)
- If you don't see it, you may need to create a new application

### 3. Get Fresh Keys
- Go to **API Keys** in the left sidebar
- Copy the **Publishable Key** (starts with `pk_test_`)
- Copy the **Secret Key** (starts with `sk_test_`)

### 4. Update Your `.env.local` File
Replace the keys in your `.env.local` file:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_new_publishable_key_here
CLERK_SECRET_KEY=your_new_secret_key_here
```

### 5. Configure Sign-In/Sign-Up URLs in Clerk Dashboard
In your Clerk Dashboard:
- Go to **Paths** (or **Settings** → **Paths**)
- Set these values:
  - **Sign-in URL**: `/sign-in`
  - **Sign-up URL**: `/sign-up`
  - **After sign-in URL**: `/`
  - **After sign-up URL**: `/`

### 6. Restart the Dev Server
After updating the keys:
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Alternative: Use Clerk's Pre-built Components

If you want to test quickly, you can also use Clerk's hosted pages:

1. In Clerk Dashboard, go to **User & Authentication** → **Email, Phone, Username**
2. Enable the authentication methods you want
3. The sign-in/sign-up pages should work automatically

## Quick Test

After fixing the keys, test by:
1. Going to http://localhost:3000/sign-in
2. You should see the Clerk sign-in form
3. Try signing up at http://localhost:3000/sign-up

## Still Not Working?

If it's still not working after updating keys:

1. **Clear browser cache and cookies**
2. **Try incognito/private browsing mode**
3. **Check Clerk Dashboard status** - make sure your app is active
4. **Verify environment variables are loaded**:
   - Add this to any page temporarily:
   ```tsx
   console.log('Clerk Key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20));
   ```

## Current Configuration

Your `.env.local` now has these Clerk URLs configured:
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

These tell Clerk where your sign-in/sign-up pages are located.
