# Email Setup Guide for PDF Reports

This guide explains how to configure email sending for the PDF reports using Resend and Vercel Serverless Functions.

## Overview

The application uses **Resend** (a free email API) with Vercel serverless functions to send PDF reports. This approach:
- **Completely FREE** - 100 emails per day, 3,000 per month
- No email account access needed - just an API key
- Works seamlessly with your existing Vercel deployment
- Supports PDF attachments out of the box
- Deploys automatically when you push code to origin

## Setup Instructions

### 1. Create a Resend Account

1. Go to https://resend.com/signup
2. Sign up with your email (it's free)
3. Verify your email address

### 2. Get Your API Key

1. Log in to Resend dashboard: https://resend.com/api-keys
2. Click "Create API Key"
3. Name it "Holistic Assessment Tool"
4. Select "Sending access"
5. Click "Add"
6. **Copy the API key** (it starts with `re_`) - you won't see it again!

### 3. Add Environment Variable to Vercel

1. Go to your Vercel dashboard: https://vercel.com/
2. Select your project
3. Go to Settings → Environment Variables
4. Add the environment variable:

   **RESEND_API_KEY**
   - Value: Your Resend API key (starts with `re_`)
   - Environment: Production, Preview, Development (select all)

5. Click "Save"

### 4. Deploy to Vercel

Simply push your code to trigger deployment:
```bash
git add .
git commit -m "Add email functionality with Resend"
git push origin main
```

Verc5. Test the Email Functionality

After deployment:
1. Navigate to the Mind section of your app
2. Complete some quizzes
3. Click the "Generate Report" button
4. Click the email icon (envelope)
5. Enter a student name
6. Click "Send Report"

The PDF report will be sent to smumair2003@gmail.com from `onboarding@resend.dev`

The PDF report should be sent to smumair2003@gmail.com

## How It Works

1. **Frontend** (`EmailReportModal.tsx`):
   - Generates PDF using @react-pdf/renderer
   - Converts PDF to base64
   - Sends POST request to `/api/send-report` with student name and PDF data

2. **Serverless Function** (`api/send-report.js`):
   - Receives the request
   - Uses Resend API to send email with PDF attachment
   - Returns success/error response

3. **Vercel**:
   - Automatically deploys the serverless function
   - Provides secure environment variables (RESEND_API_KEY)
   - Handles HTTPS and scaling

4. **Resend**:
   - Delivers the email to smumair2003@gmail.com
   - Free tier: 100 emails/day, 3,000/month
   - No email account access required

## Troubleshooting**:
   - Verify RESEND_API_KEY is set in Vercel dashboard
   - Make sure it's set for all environments (Production, Preview, Development)
   - Ensure the API key starts with `re_`

2. **Check Resend account**:
   - Log in to https://resend.com/
   - Check if your account is active
   - Verify you haven't exceeded the free tier (100 emails/day)

3  - Sometimes Gmail blocks suspicious activity
   - Check your Gmail inbox for security alerts
   - If blocked, approve the activity and try again

4. **Check function logs**:
   - Go to Vercel dashboard → Deployments → Click on deployment → Functions
   - Check the logs for `/api/send-report` for error messages

### Getting "Failed to send report" error

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try sending the report again
4. Check for detailed error messages
5. Look at the Network tab to see the API response

## Local Development

For local testing:

1. Create a `.env.local` file in the root directory:
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```

2. Install Vercel CLI (if not already installed):
   ```
   npm install -g vercel
   ```

3. Run in development mode:
   ```
   vercel dev
   ```

This will simulate the Vercel environment locally, including serverless functions.

**Note:** Resend's free tier test domain (`onboarding@resend.dev`) might end up in spam. For production, consider verifying your own domain in Resend (still free).

## Security Notes

- **Never commit** `.env.local` or any file containing EMAIL_PASS
- The `.env.local` file is already in `.gitignore`
- Environment variables in Vercel are encrypted and secure
- Gmail App Passwords are more secure than regular passRESEND_API_KEY
- The `.env.local` file is already in `.gitignore`
- Environment variables in Vercel are encrypted and secure
- Resend API keys can be regenerated anytime from the dashboard
- Only the recipient email (smumair2003@gmail.com) is hardcoded in the serverless function

## Why Resend?

- ✅ **Truly Free** - 100 emails/day, 3,000/month (more than enough for assessment reports)
- ✅ **No Email Account Needed** - Just an API key
- ✅ **Built for Developers** - Simple API, great documentation
- ✅ **Supports Attachments** - PDFs work out of the box
- ✅ **Reliable** - Built on top of AWS SES
- ✅ **Perfect for Vercel** - Designed to work with serverless functions
To change where reports are sent, edit `api/send-report.js`:

```javascript
to: 'smumair2003@gmail.com', // Change this email address
```

Then push the changes to trigger a new deployment.
cd server
npm run dev
```

You should see:
```
Email server running on port 3001
Server is ready to send emails
```

### 5. Start the Frontend Application
In a separate terminal, start your React app:

```bash
npm run dev
```

### 6. Test the Feature
1. Complete at least one Mind section quiz
2. Click the "Generate Report" button or view the report
3. Click the email icon button (✉️)
4. Enter a student name
5. Click "Send Report"
6. Check smumair2003@gmail.com inbox for the PDF

## How It Works

1. **Frontend**: Generates PDF report using @react-pdf/renderer
2. **Conversion**: Converts PDF blob to base64 string
3. **API Call**: Sends POST request to `http://localhost:3001/api/send-report`
4. **Backend**: Receives base64 PDF, converts to buffer
5. **Email**: Uses Nodemailer to send email with PDF attachment via Gmail SMTP
6. **Delivery**: Email arrives at smumair2003@gmail.com with PDF attached

## Configuration Options

### Change Recipient Email
Edit `server/index.js` line 45:
```javascript
to: 'smumair2003@gmail.com',  // Change this email
```

### Change Email Content
Edit the HTML template in `server/index.js` lines 46-62 to customize the email body.

### Change Server Port
Edit `.env` file:
```env
PORT=3001  # Change to any available port
```

Also update the frontend API URL in `src/components/EmailReportModal.tsx` line 42:
```javascript
const response = await fetch('http://localhost:3001/api/send-report', {
```

## Troubleshooting

### "Failed to send report. Please make sure the email server is running."
- Make sure you started the backend server (`cd server && npm start`)
- Check that port 3001 is not being used by another application
- Verify the server terminal shows "Email server running on port 3001"

### "Invalid login" or Authentication Error
- Double-check your Gmail App Password (not your regular Gmail password)
- Ensure 2-Step Verification is enabled on your Google Account
- Make sure there are no spaces in the App Password in your `.env` file
- Try generating a new App Password

### Email Not Received
- Check the spam/junk folder in smumair2003@gmail.com
- Verify the server terminal shows "Email sent successfully"
- Check that your Gmail account is not blocked from sending emails
- Ensure you're not hitting Gmail's sending limits (500 emails/day for free accounts)

### CORS Errors
- Verify the frontend is running on `http://localhost:5173`
- If using a different port, update CORS settings in `server/index.js`

### Port Already in Use
If port 3001 is busy, change it:
1. Update `PORT` in `server/.env`
2. Update the fetch URL in `src/components/EmailReportModal.tsx`

## Production Deployment

### Option 1: Deploy Backend to Heroku
1. Create a Heroku account
2. Install Heroku CLI
3. ```bash
   cd server
   heroku create your-app-name
   heroku config:set EMAIL_USER=your-email@gmail.com
   heroku config:set EMAIL_PASS=your-app-password
   git push heroku main
   ```
4. Update frontend fetch URL to: `https://your-app-name.herokuapp.com/api/send-report`

### Option 2: Deploy to Vercel/Netlify Functions
Convert the Express server to a serverless function.

### Option 3: Deploy to Railway/Render
Similar to Heroku, these platforms offer free tiers for backend hosting.

## Security Notes
- **Never commit `.env` file** - It's already in `.gitignore`
- **Never share your App Password** - It has full access to your Gmail
- App Passwords are safer than your main Gmail password
- Revoke App Passwords from Google Account settings if compromised
- Backend validates and sanitizes all inputs

## Gmail Sending Limits
- **Free Gmail Account**: 500 emails per day
- **Google Workspace**: 2,000 emails per day
- Reset occurs 24 hours after first email sent that day

## Alternative Email Services
If you prefer not to use Gmail, modify `server/index.js` transporter configuration:

**SendGrid:**
```javascript
const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY }
});
```

**Outlook:**
```javascript
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});
```

## Support
For issues with:
- **Nodemailer**: https://nodemailer.com/
- **Gmail App Passwords**: https://support.google.com/accounts/answer/185833
- **Express.js**: https://expressjs.com/
