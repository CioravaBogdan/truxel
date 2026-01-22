# How to Run Truxel in Android Studio (Complete Guide)

This guide will help you run the Truxel app locally and stay in sync with GitHub updates.

---

## 📋 Prerequisites (One-Time Setup)

Before starting, make sure you have these installed:

### 1. Install Node.js
- Download from: https://nodejs.org/ (LTS version)
- Verify installation: Open PowerShell and run `node --version`

### 2. Install Git
- Download from: https://git-scm.com/download/win
- During installation, keep all default options
- Verify: Run `git --version` in PowerShell

### 3. Install Android Studio
- Download from: https://developer.android.com/studio
- During installation, make sure to install:
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device (AVD)

---

## 🚀 STEP 1: Clone the Repository (First Time Only)

If you don't have the project yet:

1. Open **PowerShell** or **Command Prompt**
2. Navigate to where you want the project:
   ```powershell
   cd E:\
   ```
3. Clone the repository:
   ```powershell
   git clone https://github.com/CioravaBogdan/truxel.git
   ```
4. Enter the project folder:
   ```powershell
   cd truxel
   ```

---

## 🔄 STEP 2: Pull Latest Updates from GitHub

**Do this EVERY TIME before running the app to get the latest version:**

1. Open **PowerShell**
2. Navigate to the project:
   ```powershell
   cd E:\truxel
   ```
3. Pull the latest changes:
   ```powershell
   git pull origin main
   ```
4. Install/update dependencies:
   ```powershell
   npm install
   ```

> 💡 **Pro Tip:** You can create a shortcut script for this (see "Quick Start Script" section below)

---

## 📦 STEP 3: Generate Android Files

After pulling updates, regenerate the Android native code:

```powershell
cd E:\truxel
npx expo prebuild --platform android --clean
```

> ⚠️ This step is **required** after pulling updates that change native dependencies.

---

## 📱 STEP 4: Open in Android Studio

1. Open **Android Studio**
2. Go to **File > Open**
3. Navigate to: `E:\truxel\android` (select the **android** folder, NOT the root!)
4. Click **OK**
5. Wait for Gradle sync to complete (loading bar at bottom right)

---

## 🖥️ STEP 5: Create a Virtual Phone (Emulator)

If you don't have one yet:

1. In Android Studio, click **Device Manager** icon (phone icon on right toolbar)
   - Or go to **Tools > Device Manager**
2. Click **Create Device** (or **+**)
3. Select **Pixel 6** → Click **Next**
4. Download a System Image:
   - Click the **Download** arrow next to **API 34** (UpsideDownCake)
   - Wait for download to complete
5. Click **Next** → **Finish**
6. Click the **▶ Play** button next to your device to start it

---

## ⚡ STEP 6: Start the Metro Server (JavaScript Engine)

Open a **NEW** PowerShell window (keep it open):

```powershell
cd E:\truxel
npx expo start
```

You'll see a QR code and menu. **Keep this window open!**

---

## ▶️ STEP 7: Run the App

1. In Android Studio, make sure your emulator is selected in the top toolbar dropdown
2. Click the green **▶ Run** button
3. Wait for the build to complete (first time takes 5-10 minutes)
4. The app will launch on your emulator!

---

## 🔁 Quick Update Workflow (Daily Use)

Once everything is set up, here's your daily workflow:

```powershell
# 1. Open PowerShell and navigate to project
cd E:\truxel

# 2. Pull latest changes
git pull origin main

# 3. Install any new dependencies
npm install

# 4. If native code changed, regenerate Android files
npx expo prebuild --platform android --clean

# 5. Start Metro server
npx expo start

# 6. In Android Studio: Click Run (▶)
```

---

## 📜 Quick Start Script (Optional)

Create a file called `start-android.ps1` in `E:\truxel\`:

```powershell
# Save this as: E:\truxel\start-android.ps1
Write-Host "🔄 Pulling latest from GitHub..." -ForegroundColor Cyan
git pull origin main

Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host "🤖 Regenerating Android files..." -ForegroundColor Cyan
npx expo prebuild --platform android --clean

Write-Host "✅ Ready! Now:" -ForegroundColor Green
Write-Host "1. Open Android Studio and open E:\truxel\android" -ForegroundColor Yellow
Write-Host "2. Run: npx expo start (in a new terminal)" -ForegroundColor Yellow
Write-Host "3. Click Run in Android Studio" -ForegroundColor Yellow
```

Run it with:
```powershell
cd E:\truxel
.\start-android.ps1
```

---

## ❓ Troubleshooting

### "SDK location not found"
- Open `E:\truxel\android\local.properties`
- Make sure it contains:
  ```
  sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
  ```
- Replace `YOUR_USERNAME` with your Windows username

### "Gradle sync failed"
- In Android Studio: **File > Sync Project with Gradle Files**
- Check Java version: **File > Project Structure > SDK Location**
- Try: **Build > Clean Project** then **Build > Rebuild Project**

### "App shows red error screen"
- Make sure `npx expo start` is running in a terminal
- Press `Ctrl + M` in the emulator → Select **Reload**
- Or press `R` twice in the Metro terminal

### "Unable to load script"
- Check that Metro server is running
- In emulator, press `Ctrl + M` → **Settings** → **Debug server host**
- Enter: `10.0.2.2:8081`

### "git pull" shows merge conflicts
- Run: `git stash` (saves your local changes)
- Then: `git pull origin main`
- Then: `git stash pop` (restores your changes)

### Build takes forever / fails randomly
- Run in project root:
  ```powershell
  cd E:\truxel\android
  ./gradlew clean
  cd ..
  npx expo prebuild --platform android --clean
  ```

---

## 📱 Testing on Physical Device

1. Enable **Developer Options** on your Android phone:
   - Go to **Settings > About Phone**
   - Tap **Build Number** 7 times
2. Enable **USB Debugging** in Developer Options
3. Connect phone via USB cable
4. In Android Studio, select your phone from the device dropdown
5. Click **Run** ▶

---

## 🎯 Summary Cheat Sheet

| Task | Command |
|------|---------|
| Clone repo (first time) | `git clone https://github.com/CioravaBogdan/truxel.git` |
| Pull updates | `git pull origin main` |
| Install dependencies | `npm install` |
| Regenerate Android | `npx expo prebuild --platform android --clean` |
| Start Metro server | `npx expo start` |
| Clean build | `cd android && ./gradlew clean` |

---

*Last updated: January 2026*
