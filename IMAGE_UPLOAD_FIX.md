# 🔧 Image Upload Fix

## What I Fixed:

1. ✅ Created upload directories (`public/uploads/images` and `public/uploads/audio`)
2. ✅ Fixed undefined `BACKEND_HOST` variable in server.js
3. ✅ Added proper error handling to upload endpoints
4. ✅ Added logging to see upload status

---

## How to Apply the Fix:

### Step 1: Restart Docker Containers
```bash
npm run dev:down
npm run dev:up
```

### Step 2: Wait for Startup
Wait about 30 seconds for containers to fully start.

### Step 3: Test Image Upload
1. Go to: `http://192.168.1.46:5173`
2. Login
3. Click the 📎 file icon
4. Select an image
5. Should upload successfully! 🎉

---

## Verify Upload Directories Exist

The directories should now exist:
```
backend/
└── public/
    └── uploads/
        ├── images/
        │   └── .gitkeep
        └── audio/
            └── .gitkeep
```

---

## Check Backend Logs

If still having issues, check the logs:

```bash
docker compose -f compose.dev.yml logs backend
```

Look for:
- `Image uploaded: http://...` ✅ (Success)
- `Image upload error: ...` ❌ (Error with details)

---

## Test Upload Endpoint Directly

**Test if backend is accepting uploads:**

```bash
# Create a test image (or use any image file)
curl -X POST -F "imageFile=@path/to/your/image.jpg" http://localhost:5000/upload-image
```

Should return:
```json
{"url":"http://localhost:5000/uploads/images/1234567890-image.jpg"}
```

---

## Common Issues After Fix:

### Issue 1: Still getting error

**Solution:**
Make sure you restarted containers:
```bash
npm run dev:down
npm run dev:up
```

### Issue 2: Directory not found in Docker

**Solution:**
The directories are created on your host machine. Docker should mount them via volumes.

Check `compose.dev.yml` has:
```yaml
volumes:
  - ./backend:/usr/app/backend
```

### Issue 3: Permission denied

**Solution:**
On Windows, this shouldn't happen. But if it does:
```bash
# Give full permissions to upload directories
icacls backend\public\uploads /grant Everyone:F /T
```

---

## What Changed in Code:

### Before (Broken):
```javascript
const host = req.get('host') || `${BACKEND_HOST}:${PORT}`;
// BACKEND_HOST was undefined!
```

### After (Fixed):
```javascript
const host = req.get('host') || `localhost:${PORT}`;
// Uses actual host from request or falls back to localhost
```

### Added Error Handling:
```javascript
uploadImage.single('imageFile')(req, res, (err) => {
  if (err) {
    console.error('Image upload error:', err);
    return res.status(500).json({error: 'Image upload failed', details: err.message});
  }
  // ... rest of code
});
```

---

## Test Checklist:

After restarting, verify:

- [ ] Backend starts without errors
- [ ] Can access: `http://localhost:5000`
- [ ] Can login to chat
- [ ] Can click file icon
- [ ] Can select image
- [ ] Image uploads successfully
- [ ] Image appears in chat
- [ ] Other users see the image

---

## Expected Behavior:

### When Upload Works:

1. **Click 📎 icon** → File picker opens
2. **Select image** → Upload starts
3. **Brief loading** → Image uploading
4. **Image appears** → In chat with proper sizing
5. **Backend logs** → "Image uploaded: http://..."

### Backend Console:
```
Image uploaded: http://192.168.1.46:5000/uploads/images/1731612345678-photo.jpg
```

### Browser Console:
```
Image upload successful
```

---

## Summary:

The image upload should now work! Just restart your containers:

```bash
npm run dev:down
npm run dev:up
```

Then try uploading an image. It should work! 🎉
