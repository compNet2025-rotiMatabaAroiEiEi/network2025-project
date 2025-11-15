# Network Access Guide

## How to Access This Chat App from Other Computers

### Your PC's Network Information:
- **Local IP Address**: `192.168.1.46`
- **Backend Port**: `5000`
- **Frontend Port**: `5173`

---

## Option 1: Local Network Access (Same WiFi)

### For Users on the Same WiFi Network:

**Step 1: Start the Application**
On your PC (the host), run:
```bash
npm run dev:up
```

**Step 2: Access from Other Computers**
On other computers connected to the same WiFi, open a browser and go to:
```
http://192.168.1.46:5173
```

**That's it!** They can now use the chat app and send messages to you.

---

## Option 2: Internet Access (Port Forwarding)

To allow access from anywhere on the internet:

### Step 1: Configure Router Port Forwarding

1. Open your router admin panel (usually `192.168.1.1` or `192.168.0.1`)
2. Login with admin credentials
3. Find "Port Forwarding" or "Virtual Server" settings
4. Add these rules:

| Service Name | External Port | Internal IP    | Internal Port | Protocol |
|--------------|---------------|----------------|---------------|----------|
| Chat-Backend | 5000          | 192.168.1.46   | 5000          | TCP      |
| Chat-Frontend| 5173          | 192.168.1.46   | 5173          | TCP      |

### Step 2: Find Your Public IP

Visit: https://whatismyipaddress.com/

Let's say your public IP is: `203.0.113.45`

### Step 3: Share Access URL

Share this URL with others:
```
http://203.0.113.45:5173
```

### Step 4: Update Frontend Configuration

Update `frontend/.env`:
```env
VITE_BACKEND_HOST=203.0.113.45
```

Restart the application:
```bash
npm run dev:down
npm run dev:up
```

---

## Option 3: Use Ngrok (Easiest for Internet Access)

### Step 1: Install Ngrok
Download from: https://ngrok.com/download

### Step 2: Start Your Application
```bash
npm run dev:up
```

### Step 3: Create Tunnels

**Terminal 1 (Backend):**
```bash
ngrok http 5000
```
You'll get a URL like: `https://abc123.ngrok.io`

**Terminal 2 (Frontend):**
```bash
ngrok http 5173
```
You'll get a URL like: `https://xyz789.ngrok.io`

### Step 4: Update Frontend Configuration

Update `frontend/.env`:
```env
VITE_BACKEND_HOST=abc123.ngrok.io
```

Restart frontend:
```bash
docker compose -f compose.dev.yml restart frontend
```

### Step 5: Share Frontend URL

Share the frontend ngrok URL with others:
```
https://xyz789.ngrok.io
```

---

## Troubleshooting

### Firewall Issues
If others can't connect, check Windows Firewall:

1. Open "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Make sure Docker Desktop is allowed for both Private and Public networks

### Can't Access from Other Computers?

**Check if ports are open:**
```bash
# On your PC, run:
netstat -an | findstr "5000 5173"
```

You should see:
```
TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING
TCP    0.0.0.0:5173    0.0.0.0:0    LISTENING
```

### Connection Refused?

Make sure Docker containers are running:
```bash
docker ps
```

You should see 3 containers: backend, frontend, mongo

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **No Authentication**: Anyone with the URL can access your chat
2. **No HTTPS**: Messages are sent in plain text
3. **No Rate Limiting**: Vulnerable to spam/abuse
4. **Development Mode**: Not optimized for production

**For production use, consider:**
- Deploy to a cloud platform (Vercel, Railway, etc.)
- Add user authentication
- Enable HTTPS
- Add rate limiting
- Use environment-specific configurations

---

## Quick Reference

### Your PC (Host):
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

### Other PCs (Same Network):
- Frontend: `http://192.168.1.46:5173`
- Backend: `http://192.168.1.46:5000`

### Check if Server is Running:
```bash
curl http://192.168.1.46:5000
```

Should return: `{"message":"Server is running!","status":"ok"}`
