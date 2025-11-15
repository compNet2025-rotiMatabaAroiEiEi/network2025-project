# ✅ Your PC is Now a Server!

## Configuration Complete

Your PC (IP: **192.168.1.46**) is now configured as a server that other computers can access.

---

## How to Start Your Server

### Step 1: Start the Application
```bash
npm run dev:up
```

### Step 2: Wait for Containers to Start
You should see:
```
✔ Container backend  Started
✔ Container frontend Started
```

### Step 3: Server is Ready!
Backend will show:
```
Server running on:
  - Local:   http://localhost:5000
  - Network: http://192.168.1.46:5000
```

---

## How to Access

### From Your PC (Host):
```
http://localhost:5173
```

### From Other PCs (Same WiFi):
```
http://192.168.1.46:5173
```

---

## What Changed

### Backend (`backend/src/server.js`):
✅ Server binds to `0.0.0.0` (accepts connections from any network interface)
✅ Shows both local and network URLs on startup
✅ File uploads use dynamic host (works from any IP)

### Frontend (`frontend/src/App.jsx`):
✅ Uses environment variable for backend host
✅ Falls back to current hostname if not set

### Environment (`frontend/.env`):
✅ Backend host set to your IP: `192.168.1.46`

---

## Firewall Setup (Required!)

You need to allow the ports through Windows Firewall:

### Quick Method:
1. Press `Windows + R`
2. Type: `firewall.cpl`
3. Click "Allow an app through firewall"
4. Find "Docker Desktop"
5. Check ✅ Private network
6. Click OK

### OR Command Line:
```powershell
New-NetFirewallRule -DisplayName "Chat Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Chat Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

---

## Test Your Server

### Test 1: From Your PC
```bash
# Test backend
curl http://localhost:5000

# Should return: {"message":"Server is running!","status":"ok"}
```

### Test 2: From Another PC (Same WiFi)
Open browser and go to:
```
http://192.168.1.46:5173
```

You should see the login page! 🎉

---

## Troubleshooting

### Problem: Can't access from other PCs

**Check 1: Is Docker running?**
```bash
docker ps
```
Should show 2 containers: backend, frontend

**Check 2: Are ports listening?**
```bash
netstat -an | findstr "5000 5173"
```
Should show:
```
TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING
TCP    0.0.0.0:5173    0.0.0.0:0    LISTENING
```

**Check 3: Is firewall blocking?**
- Temporarily disable firewall to test
- If it works, then add firewall rules (see above)
- Re-enable firewall

**Check 4: Is your IP correct?**
```bash
ipconfig | findstr "IPv4"
```
Should show: `192.168.1.46`

If IP changed, update `frontend/.env` with new IP

---

## Stop Your Server

```bash
npm run dev:down
```

---

## Share with Friends

Tell them to:
1. Connect to the same WiFi as you
2. Open browser
3. Go to: `http://192.168.1.46:5173`
4. Login and chat!

---

## Features Working

✅ Real-time messaging (global, private, group)
✅ User management (login/logout)
✅ Typing indicators
✅ Message history
✅ File uploads (audio, images)
✅ Network access from other PCs

---

## Important Notes

⚠️ **Your PC must stay on** for others to access the server
⚠️ **Same WiFi required** (unless you setup port forwarding)
⚠️ **Firewall must allow** ports 5000 and 5173
⚠️ **IP may change** if you restart router (update .env if needed)

---

## Advanced: Internet Access

Want people outside your WiFi to access?

### Option 1: Port Forwarding
1. Login to your router (usually 192.168.1.1)
2. Find "Port Forwarding" settings
3. Forward ports 5000 and 5173 to 192.168.1.46
4. Share your public IP (find at: whatismyipaddress.com)

### Option 2: Ngrok (Easier)
1. Install ngrok: https://ngrok.com/download
2. Run: `ngrok http 5173`
3. Share the ngrok URL

---

## Summary

Your PC is now a server! 🎉

**Access URLs:**
- Your PC: `http://localhost:5173`
- Other PCs: `http://192.168.1.46:5173`

**Next Steps:**
1. Start server: `npm run dev:up`
2. Allow firewall (see above)
3. Share URL with friends
4. Start chatting!

Enjoy your chat server! 🚀
