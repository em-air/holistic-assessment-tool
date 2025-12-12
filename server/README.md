# Email Server for Holistic Assessment Tool

This is a simple Express.js server that handles sending PDF report emails with attachments using Nodemailer.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Add your Gmail credentials (see main EMAIL_SETUP_GUIDE.md for details)

3. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **The server will run on:** `http://localhost:3001`

## API Endpoints

### POST /api/send-report
Sends a PDF report via email

**Request Body:**
```json
{
  "studentName": "John Doe",
  "pdfBase64": "base64-encoded-pdf-string",
  "reportDate": "12/12/2025"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report sent successfully",
  "messageId": "message-id-from-email-provider"
}
```

### GET /api/health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "message": "Email server is running"
}
```

## Environment Variables

Create a `.env` file with:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
PORT=3001
```

## Security

- Never commit `.env` file (already in .gitignore)
- Use Gmail App Passwords, not your main password
- All inputs are validated and sanitized

## Troubleshooting

See the main [EMAIL_SETUP_GUIDE.md](../EMAIL_SETUP_GUIDE.md) for detailed troubleshooting steps.
