# How to Make Your Server Secure (HTTPS)

## Option 1: ngrok (Recommended - Easiest)

### Step 1: Install ngrok
1. Download from: https://ngrok.com/download
2. Extract and place `ngrok.exe` in a folder
3. Sign up for free account at https://ngrok.com
4. Get your auth token from dashboard

### Step 2: Setup ngrok
Open PowerShell and run:
```powershell
# Set your auth token (only once)
.\ngrok.exe config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Step 3: Start Your App
```powershell
# Terminal 1: Start your app
npm run dev:up
```

### Step 4: Create Tunnels
```powershell
# Terminal 2: Tunnel for backend
.\ngrok.exe http 5000

# Terminal 3: Tunnel for frontend  
.\ngrok.exe http 5173
```

### Step 5: Update Configuration
You'll get URLs like:
- Backend: `https://abc123.ngrok-free.app`
- Frontend: `https://xyz789.ngrok-free.app`

Update `frontend/.env`:
```
VITE_BACKEND_HOST=abc123.ngrok-free.app
```

### Step 6: Share Frontend URL
Share the frontend ngrok URL with others:
```
https://xyz789.ngrok-free.app
```

✅ **Benefits:**
- Instant HTTPS (microphone works!)
- Works from anywhere (not just local network)
- Free tier available
- No certificate setup needed

❌ **Limitations:**
- URL changes each time you restart ngrok (unless you pay)
- Free tier has connection limits

---

## Option 2: Self-Signed Certificate (Local Network Only)

This works for local network but browsers will show security warnings.

### Step 1: Generate Certificate
Create `generate-cert.ps1`:
```powershell
# Generate self-signed certificate
$cert = New-SelfSignedCertificate `
    -DnsName "localhost", "192.168.1.46" `
    -CertStoreLocation "cert:\LocalMachine\My" `
    -NotAfter (Get-Date).AddYears(5)

# Export certificate
$pwd = ConvertTo-SecureString -String "password123" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath ".\backend\cert\server.pfx" -Password $pwd

Write-Host "Certificate created! Thumbprint: $($cert.Thumbprint)"
```

Run as Administrator:
```powershell
.\generate-cert.ps1
```

### Step 2: Update Backend Server
Install HTTPS module:
```powershell
cd backend
npm install https fs
```

Update `backend/src/server.js`:
```javascript
const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");

// ... existing code ...

// HTTPS configuration
const httpsOptions = {
  pfx: fs.readFileSync(path.join(__dirname, '../cert/server.pfx')),
  passphrase: 'password123'
};

const server = https.createServer(httpsOptions, app);

// ... rest of code ...

server.listen(5000, '0.0.0.0', () => {
  console.log(`Server running on:`);
  console.log(`  - Local:   https://localhost:5000`);
  console.log(`  - Network: https://192.168.1.46:5000`);
});
```

### Step 3: Update Frontend
Update `frontend/.env`:
```
VITE_BACKEND_HOST=192.168.1.46
```

Update socket connection in `frontend/src/App.jsx`:
```javascript
const newSocket = io(`https://${backendHost}:5000`, {
  rejectUnauthorized: false // For self-signed cert
});
```

### Step 4: Configure Vite for HTTPS
Update `frontend/vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../backend/cert/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, '../backend/cert/server.cert'))
    },
    host: '0.0.0.0',
    port: 5173
  }
})
```

⚠️ **Note:** Browsers will show security warnings. Users must click "Advanced" → "Proceed anyway"

---

## Option 3: Deploy to Cloud (Production)

For real production use, deploy to:

### Free Options:
1. **Vercel** (Frontend) + **Railway** (Backend)
   - Frontend: https://vercel.com
   - Backend: https://railway.app
   - Both have free tiers with HTTPS

2. **Render** (Full Stack)
   - https://render.com
   - Free tier with HTTPS
   - Can host both frontend and backend

3. **Heroku** (Full Stack)
   - https://heroku.com
   - Free tier available
   - Automatic HTTPS

---

## Comparison

| Option | Difficulty | Cost | Microphone | Network Access |
|--------|-----------|------|------------|----------------|
| ngrok | ⭐ Easy | Free/Paid | ✅ Yes | 🌍 Internet |
| Self-Signed | ⭐⭐ Medium | Free | ✅ Yes* | 🏠 Local only |
| Cloud Deploy | ⭐⭐⭐ Hard | Free/Paid | ✅ Yes | 🌍 Internet |

*With security warnings

---

## Quick Start: ngrok (Recommended)

1. Download ngrok: https://ngrok.com/download
2. Run your app: `npm run dev:up`
3. In new terminal: `ngrok http 5000`
4. In another terminal: `ngrok http 5173`
5. Update `.env` with ngrok backend URL
6. Share ngrok frontend URL with friends

That's it! Your app is now secure with HTTPS and microphone will work! 🎉
