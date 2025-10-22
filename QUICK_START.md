# 🚀 Quick Fix Guide - Start Here!

## ❌ Error You're Seeing:
```
ConfigError: The expected package.json path: C:\Users\ciora\package.json does not exist
```

## ✅ SOLUTION - Follow These Steps:

### Step 1: Navigate to the Correct Directory
```powershell
# Find where your project is located (example paths):
cd C:\Users\ciora\Documents\GitHub\truxel
# OR
cd C:\Users\ciora\Desktop\truxel
# OR
cd C:\Users\ciora\Projects\truxel

# Verify you're in the right place (should list package.json)
dir
```

**You'll know you're in the right place when you see:**
- ✅ package.json
- ✅ app.json
- ✅ app/ folder
- ✅ components/ folder

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Configure Environment Variables
Edit the `.env` file (already created for you) with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

Get these from: https://app.supabase.com/project/_/settings/api

### Step 4: Start the App
```powershell
npm run dev
```

## 🎯 That's It! Your App Should Now Start

When you see the QR code and options to press 'a', 'i', or 'w' - you're good to go!

---

## 📱 What to Do Next:

### For Android:
1. Start Android Emulator in Android Studio
2. Press `a` in the Expo terminal

### For Physical Device:
1. Install **Expo Go** app from app store
2. Connect to same WiFi as your computer
3. Scan the QR code shown in terminal

### For Web:
1. Press `w` in the Expo terminal
2. Browser will open automatically

---

## ⚠️ Still Not Working?

### Problem: Node.js Version Warnings
**Quick Fix:** These are warnings, not errors. The app will work. To eliminate warnings:
1. Download Node.js 20.19.4+ from https://nodejs.org/
2. Install it
3. Restart terminal
4. Run `npm install` again

### Problem: Supabase Connection Error
**Quick Fix:** Check your `.env` file has correct credentials from Supabase dashboard.

### Problem: "Cannot find module..."
**Quick Fix:**
```powershell
rm -r node_modules
npm install
```

---

## 📚 Need More Help?

1. **Windows-specific issues:** Read `WINDOWS_SETUP.md`
2. **General setup:** Read `README.md`
3. **Package updates:** Read `UPDATE_RECOMMENDATIONS.md`

---

## 🎓 Pro Tips:

1. **Always navigate to project directory first** - Don't run `npx expo start` from random folders!
2. **Use `npm run dev`** instead of `npx expo start` for consistency
3. **Keep terminal open** - Don't close it while developing
4. **Use VS Code** integrated terminal for convenience

---

## ✅ Checklist Before Starting:

- [ ] I'm in the correct project directory (can see package.json)
- [ ] I ran `npm install`
- [ ] I configured `.env` with my Supabase credentials
- [ ] I have Node.js 20.15.0 or higher installed
- [ ] I'm ready to run `npm run dev`

**Once all checked, run:** `npm run dev` 🚀
