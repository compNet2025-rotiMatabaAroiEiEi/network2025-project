# 🔄 Restart Server with IP Address

## Your Configuration:
- **Your IP**: `192.168.1.46`
- **Backend**: `http://192.168.1.46:5000`
- **Frontend**: `http://192.168.1.46:5173`

---

## Step-by-Step Restart:

### 1. Stop Containers
```bash
npm run dev:down
```

### 2. Start Containers (Fresh Build)
```bash
npm run dev:up
```

### 3. Wait for Startup
Wait about 30 seconds for containers to fully start.

You should see:
```
✔ Container backend  Started
✔ Container frontend Started
```

### 4. Clear Browser Cache
Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)

### 5. Access the App

**From Your PC:**
```
http://192.168.1.46:5173
```

**OR**
```
http://localhost:5173
```

Both should work!

---

## Verify It's Working:

### Test Backend:
Open browser: `http://192.168.1.46:5000`

Should show:
```json
{"message":"Server is running!","status":"ok"}
```

### Test Frontend:
Open browser: `http://192.168.1.46:5173`

Should show the login page.

---

## From Another PC (Same WiFi):

Open browser: `http://192.168.1.46:5173`

Should work! 🎉

---

## If Still Not Working:

### Check Docker:
```bash
docker ps
```

Should show 2 containers running.

### Check Logs:
```bash
docker compose -f compose.dev.yml logs backend
```

Look for:
```
Server running on:
  - Local:   http://localhost:5000
  - Network: http://192.168.1.46:5000
```

### Rebuild Everything:
```bash
docker compose -f compose.dev.yml down
docker compose -f compose.dev.yml up --build
```

This forces a complete rebuild with the new configuration.
