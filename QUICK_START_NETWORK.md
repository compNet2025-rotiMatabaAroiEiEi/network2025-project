# 🚀 Quick Start: Let Others Access Your Chat

## For Same WiFi Network (Easiest!)

### On Your PC (Host):

1. **Start the app:**
   ```bash
   npm run dev:up
   ```

2. **Share this URL with others on the same WiFi:**
   ```
   http://192.168.1.46:5173
   ```

3. **That's it!** They can now chat with you! 🎉

---

## Testing It Works

### On Your PC:
Open browser and go to: `http://localhost:5173`

### On Another PC (Same WiFi):
Open browser and go to: `http://192.168.1.46:5173`

Both should be able to:
- ✅ Login with different usernames
- ✅ See each other in the user list
- ✅ Send messages to each other
- ✅ Create and join groups

---

## Troubleshooting

### "Can't connect" error?

**1. Check if Docker is running:**
```bash
docker ps
```

**2. Check Windows Firewall:**
- Open Windows Defender Firewall
- Click "Allow an app through firewall"
- Make sure Docker Desktop is checked for Private networks

**3. Verify your IP hasn't changed:**
```bash
ipconfig | findstr "IPv4"
```

If IP changed, update `frontend/.env` with new IP.

---

## Stop the App

```bash
npm run dev:down
```

---

## Need Internet Access?

See `NETWORK_ACCESS.md` for:
- Port forwarding setup
- Ngrok tunnel setup
- Cloud deployment options
