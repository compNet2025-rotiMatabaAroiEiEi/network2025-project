# 🔧 Login Troubleshooting Guide

## Can't Login? Follow These Steps:

### Step 1: Restart Docker Containers

The changes need a fresh restart:

```bash
# Stop containers
npm run dev:down

# Start containers (rebuild)
npm run dev:up
```

Wait for both containers to start completely.

---

### Step 2: Clear Browser Cache

**Option A: Hard Refresh**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Option B: Clear Cache**
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Option C: Incognito/Private Window**
- Try opening in a new incognito window

---

### Step 3: Check Connection

**Open Browser Console** (F12 → Console tab)

Look for errors like:
- ❌ `Failed to connect to ws://...`
- ❌ `net::ERR_CONNECTION_REFUSED`
- ❌ `Socket connection error`

---

### Step 4: Verify Backend is Running

**Test backend directly:**

Open browser and go to:
```
http://localhost:5000
```

Should show:
```json
{"message":"Server is running!","status":"ok"}
```

If this doesn't work, backend isn't running properly.

---

### Step 5: Check Docker Containers

```bash
docker ps
```

Should show:
```
CONTAINER ID   IMAGE                    STATUS
abc123         frontend                 Up
def456         backend                  Up
```

If containers aren't running:
```bash
docker compose -f compose.dev.yml logs
```

Look for errors in the logs.

---

### Step 6: Check Socket Connection

**In Browser Console (F12), type:**
```javascript
localStorage.clear()
location.reload()
```

Then try logging in again.

---

## Common Issues & Solutions

### Issue 1: "Username already taken" but no one is logged in

**Solution:**
```bash
# Restart backend to clear in-memory users
docker compose -f compose.dev.yml restart backend
```

### Issue 2: Stuck on login page, no error

**Check:**
1. Is socket connecting? (Check browser console)
2. Is backend running? (Visit http://localhost:5000)
3. Clear localStorage and try again

**Solution:**
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Issue 3: "Connection not ready" error

**Solution:**
Wait a few seconds for socket to connect, then try again.

Or restart frontend:
```bash
docker compose -f compose.dev.yml restart frontend
```

### Issue 4: Can't connect from other PC

**Check:**
1. Is firewall allowing connections?
2. Is IP correct in `.env` file?
3. Are both PCs on same WiFi?

**Test from other PC:**
```
http://192.168.1.46:5000
```

Should show: `{"message":"Server is running!","status":"ok"}`

---

## Debug Mode

### Check Backend Logs:
```bash
docker compose -f compose.dev.yml logs backend
```

Look for:
- `Server running on...` ✅
- `connected: <socket-id>` ✅
- `register user: <username>` ✅

### Check Frontend Logs:
```bash
docker compose -f compose.dev.yml logs frontend
```

### Check Browser Console:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for Socket.IO connection messages
4. Should see: `Socket connected` or similar

---

## Step-by-Step Login Test

### 1. Open Browser Console (F12)

### 2. Go to Login Page
```
http://localhost:5173
```

### 3. Enter Username and Select Avatar

### 4. Click "GO!"

### 5. Watch Console for:
```
Socket connected
Emitting register event
Register success
Navigating to /chat/global
```

If you see errors, note them down.

---

## Quick Fixes

### Fix 1: Complete Reset
```bash
# Stop everything
npm run dev:down

# Clear browser
# Press F12 → Console → Type:
localStorage.clear()
sessionStorage.clear()

# Restart
npm run dev:up

# Wait 30 seconds, then try login
```

### Fix 2: Check .env File

Make sure `frontend/.env` exists:
```env
VITE_BACKEND_HOST=192.168.1.46
```

For localhost only, change to:
```env
VITE_BACKEND_HOST=localhost
```

Then restart:
```bash
npm run dev:down
npm run dev:up
```

### Fix 3: Rebuild Containers
```bash
docker compose -f compose.dev.yml down
docker compose -f compose.dev.yml up --build
```

---

## Still Not Working?

### Collect Debug Info:

**1. Backend Status:**
```bash
curl http://localhost:5000
```

**2. Container Status:**
```bash
docker ps
```

**3. Backend Logs:**
```bash
docker compose -f compose.dev.yml logs backend --tail=50
```

**4. Browser Console:**
- Take screenshot of any errors in F12 console

**5. Network Tab:**
- F12 → Network tab
- Try to login
- Look for failed requests (red)
- Check WebSocket connection

Share this information for further help!

---

## Expected Behavior

### When Login Works:

1. **Enter username** → No error
2. **Click GO!** → Brief loading
3. **Redirect** → Goes to `/chat/global`
4. **See chat interface** → With your username

### Backend Logs Should Show:
```
connected: abc123xyz
register user: YourUsername , id: abc123xyz
Current users: { YourUsername: 'abc123xyz' }
```

### Browser Console Should Show:
```
Socket connected
Register success
```

---

## Quick Checklist

Before asking for help, verify:

- [ ] Docker containers are running (`docker ps`)
- [ ] Backend responds at `http://localhost:5000`
- [ ] Frontend loads at `http://localhost:5173`
- [ ] Browser console shows no errors (F12)
- [ ] Tried clearing cache and localStorage
- [ ] Tried restarting containers
- [ ] Tried different browser/incognito mode

If all checked and still not working, there might be a deeper issue.
