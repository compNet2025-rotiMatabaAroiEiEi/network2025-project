# Enable Microphone on Insecure Origins (Chrome)

## Method 1: Chrome Flags (Easiest)

### Step 1: Open Chrome Flags
In Chrome, go to:
```
chrome://flags/#unsafely-treat-insecure-origin-as-secure
```

### Step 2: Add Your URLs
In the field, add your URLs (comma-separated):
```
http://192.168.1.46:5173,http://192.168.1.46:5000
```

Or if using localhost:
```
http://localhost:5173,http://localhost:5000
```

### Step 3: Enable the Flag
Set the dropdown to **"Enabled"**

### Step 4: Restart Chrome
Click the **"Relaunch"** button at the bottom

✅ **Done!** Microphone will now work on HTTP

---

## Method 2: Command Line Flag

### Windows:
Close Chrome completely, then run:
```powershell
"C:\Program Files\Google\Chrome\Application\chrome.exe" --unsafely-treat-insecure-origin-as-secure="http://192.168.1.46:5173" --user-data-dir=C:\chrome-dev
```

### Create a Shortcut:
1. Right-click Desktop → New → Shortcut
2. Paste the command above
3. Name it "Chrome - Insecure Origins"
4. Use this shortcut to open Chrome

---

## Method 3: For All Users on Network

Each user needs to do this on their own browser:

### Instructions to Share (Chrome):
```
1. Open Chrome
2. Go to: chrome://flags/#unsafely-treat-insecure-origin-as-secure
3. Paste: http://192.168.1.46:5173,http://192.168.1.46:5000
4. Set to "Enabled"
5. Click "Relaunch"
```

### Instructions to Share (Edge):
```
1. Open Edge
2. Go to: edge://flags/#unsafely-treat-insecure-origin-as-secure
3. Paste: http://192.168.1.46:5173,http://192.168.1.46:5000
4. Set to "Enabled"
5. Click "Restart"
```

---

## Quick Test

After enabling, test microphone access:
1. Go to: `http://192.168.1.46:5173`
2. Login to your chat app
3. Try recording a voice message
4. Chrome should ask for microphone permission (click Allow)

---

## Important Notes

⚠️ **Security Warning:**
- This makes Chrome treat HTTP as secure
- Only use for development/testing
- Don't use on public networks
- Only add URLs you trust

✅ **Advantages:**
- No need for HTTPS setup
- Works on local network
- Everyone can use microphone
- No ngrok needed

❌ **Disadvantages:**
- Each user must configure their Chrome
- Only works in Chrome (not other browsers)
- Not recommended for production
- Security risk if used carelessly

---

## Alternative: Microsoft Edge

Edge works exactly the same as Chrome (same engine):

1. Go to: `edge://flags/#unsafely-treat-insecure-origin-as-secure`
2. Add: `http://192.168.1.46:5173,http://192.168.1.46:5000`
3. Set to: **"Enabled"**
4. Click: **"Restart"**

✅ Done! Microphone works on HTTP in Edge

---

## Alternative: Firefox

Firefox also allows this:

1. Go to: `about:config`
2. Search for: `media.devices.insecure.enabled`
3. Set to: `true`
4. Search for: `media.getusermedia.insecure.enabled`
5. Set to: `true`

---

## Recommended Setup

**For Development (Your Network):**
1. Use Chrome flags method above
2. Share instructions with all users
3. Everyone can use microphone

**For Production (Real Users):**
1. Use ngrok or deploy to cloud
2. Get real HTTPS
3. No browser configuration needed

---

## Summary

**Fastest Solution:**
1. Open: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. Add: `http://192.168.1.46:5173,http://192.168.1.46:5000`
3. Enable and Relaunch
4. Done! 🎉

Your microphone will now work on HTTP without HTTPS!
