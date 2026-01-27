# Environment Configuration Notes

## Production Deployment Configuration

### VITE_API_URL (Critical for Production)

The `VITE_API_URL` environment variable in `.env` is currently set to `http://localhost:3001` for local development.

**For production deployment on Vercel, this MUST be updated:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add or update `VITE_API_URL` to your Railway backend URL:
   ```
   VITE_API_URL=https://your-app.railway.app
   ```
   (Replace `your-app` with your actual Railway application name)

3. Make sure to set this for all environments (Production, Preview, Development) as needed.

### Other Required Environment Variables for Vercel

Make sure these are also configured in Vercel:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_BASE_PATH` - Set to `/` for production (not `/holistic-assessment-tool`)

### Session Storage Note

The Supabase client is configured to use `sessionStorage` instead of `localStorage`. This means:
- Sessions are tab-specific (each browser tab has its own session)
- Closing a tab ends that session
- Users need to log in again when opening a new tab
- Multiple users can be logged in simultaneously on different tabs

This is intentional to prevent session conflicts when multiple users share the same browser.
