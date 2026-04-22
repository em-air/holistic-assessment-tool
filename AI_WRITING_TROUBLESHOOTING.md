x# AI Writing Evaluation - Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "AI evaluation keeps returning fallback/basic feedback"

**Symptoms:**
- Yellow warning banner appears: "AI service is busy - showing basic feedback"
- Generic feedback instead of detailed AI analysis
- Same basic scores every time (3, 3, 2, 2, 3, 2)

**Possible Causes & Solutions:**

#### 1. Missing or Invalid API Key
**Check:**
```bash
# In backend/.env file
GEMINI_API_KEY=your_api_key_here
```

**Fix:**
- Verify the API key is set in `backend/.env`
- Get a valid API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Make sure there are no extra spaces or quotes around the key
- Restart the backend server after updating the .env file

#### 2. Rate Limiting (429 errors)
**Cause:** Too many requests to Gemini API in a short period

**Solutions:**
- Wait a few minutes before trying again
- The system now automatically retries with exponential backoff
- Check your API quota at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Consider upgrading your API plan if you're hitting limits frequently

#### 3. Service Unavailability (503 errors)
**Cause:** Gemini API temporarily overloaded or down

**Solutions:**
- Wait a few minutes and use the "Retry AI Analysis" button
- The system automatically tries 3 different Gemini models with fallback
- Check [Google Cloud Status](https://status.cloud.google.com/) for service status

#### 4. Backend Not Running
**Check:**
```bash
cd backend
npm run dev
```

**Fix:**
- Make sure the backend server is running on port 3001
- Check terminal for any startup errors
- Verify VITE_API_URL in frontend .env points to http://localhost:3001

---

## Verifying the Fix

### 1. Check Backend Logs
When you submit writing for evaluation, you should see:
```
[INFO] Writing evaluation request received
[INFO] Model gemini-2.5-flash used successfully
```

Or if there's an issue:
```
[WARN] Gemini API error: {model: 'gemini-2.5-flash', attempt: 1, error: '...'}
[WARN] Model gemini-2.5-flash exhausted retries, falling back to next model
```

### 2. Test the Evaluation
1. Go to Writing Test for any grade
2. Select a topic and write at least 50 words
3. Click "Get AI Feedback"
4. Look for:
   - ✅ Detailed, unique feedback (not generic)
   - ✅ Varied scores across different criteria
   - ✅ No yellow warning banner
   - ❌ Generic "Thank you for your writing!" message

---

## Recent Improvements Made

### Enhanced Error Handling
- **Retry Logic**: Automatically retries failed requests up to 3 times with exponential backoff
- **Multi-Model Fallback**: Tries gemini-2.5-flash → gemini-2.0-flash → gemini-1.5-flash
- **Better Logging**: Detailed error information for debugging

### User Experience
- **Warning Banners**: Clear indication when AI analysis is unavailable
- **Error-Specific Messages**: Different messages for rate limits, service issues, etc.
- **Retry Button**: One-click retry if evaluation fails
- **Fallback Scores**: Functional fallback evaluation so testing can continue

---

## API Key Setup (Detailed)

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the API key (starts with "AIza...")
5. Add to `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
6. Restart backend server:
   ```bash
   cd backend
   npm run dev
   ```

### API Key Quotas (Free Tier)
- **Rate Limit**: 60 requests per minute
- **Daily Limit**: 1,500 requests per day
- **Token Limit**: Varies by model

---

## Monitoring & Debugging

### Check Backend Health
```bash
# Terminal where backend is running
# You should see:
✓ Server running on port 3001
✓ Gemini AI configured
```

### View Detailed Logs
Backend logs will show:
- `[INFO]` - Successful operations
- `[WARN]` - Retries and fallbacks
- `[ERROR]` - Failures

### Common Log Messages

**Success:**
```
[INFO] Writing evaluation completed successfully
```

**Rate Limited:**
```
[WARN] Gemini API error: { isRateLimited: true, error: '429 Too Many Requests' }
[INFO] Retrying in 1000ms...
```

**Invalid API Key:**
```
[ERROR] Error evaluating writing: GEMINI_API_KEY environment variable is not set
```

---

## Production Deployment

### Environment Variables Needed

**Railway/Heroku/etc:**
```env
GEMINI_API_KEY=your_production_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_ANON_KEY=your_anon_key
FRONTEND_URL=your_frontend_url
```

**Vercel (Frontend):**
```env
VITE_API_URL=https://your-backend.railway.app
```

### Testing in Production
1. Submit a test writing sample
2. Check Railway/Heroku logs for errors
3. Verify API key is set correctly in environment variables
4. Monitor quota usage in Google AI Studio

---

## Still Having Issues?

### Debug Checklist
- [ ] Backend server is running (`npm run dev` in backend folder)
- [ ] `GEMINI_API_KEY` is set in `backend/.env`
- [ ] API key is valid (test at [Google AI Studio](https://makersuite.google.com/app/apikey))
- [ ] Not hitting rate limits (check API console)
- [ ] Frontend can reach backend (check browser console for network errors)
- [ ] No CORS errors (check `FRONTEND_URL` in backend .env)

### Network Errors
If you see "Failed to fetch" or connection errors:
1. Verify backend URL: `http://localhost:3001` (development)
2. Check `.env` file: `VITE_API_URL=http://localhost:3001`
3. Test backend directly: `curl http://localhost:3001/api/health`

### Still Stuck?
Check the backend terminal for detailed error messages. The system now logs:
- Which model was attempted
- Number of retry attempts
- Specific error types (rate limit, service unavailable, etc.)
- Whether fallback was used

---

## Summary of Changes

### What Was Fixed:
1. ✅ **Retry Logic**: Automatic retries with exponential backoff (up to 3 attempts per model)
2. ✅ **Multi-Model Fallback**: Tries 3 different Gemini models automatically
3. ✅ **Better Error Messages**: User-friendly messages for different error types
4. ✅ **Warning Banners**: Visual indication when AI analysis is unavailable
5. ✅ **Retry Button**: Allows users to retry evaluation without rewriting
6. ✅ **Enhanced Logging**: Detailed logs for debugging
7. ✅ **JSON Parsing**: More robust extraction of AI responses (handles code blocks)

### What Happens Now When AI Fails:
- System tries 3 models × 3 retries = up to 9 attempts total
- Clear warning shown to user about why AI analysis failed
- Functional fallback evaluation provided
- One-click retry button available
- User's writing is still saved and tracked

The system is now much more resilient and provides better feedback when issues occur!
