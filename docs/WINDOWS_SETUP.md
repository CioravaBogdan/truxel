# Windows Setup Guide for Truxel Mobile App

## 🚨 Common Issues and Solutions

### Issue 1: `ConfigError: The expected package.json path does not exist`

**Problem:** You're running the command from the wrong directory.

**Solution:**
```powershell
# Navigate to the project directory first
cd C:\Users\ciora\Documents\GitHub\truxel

# Verify you're in the correct location (should list package.json)
dir

# Then start the app
npm run dev
```

### Issue 2: Node.js Version Warnings

**Problem:** `npm warn EBADENGINE Unsupported engine ... required: { node: '>= 20.19.4' }`

**Current Status:** You have Node.js v20.15.0, packages require >= 20.19.4

**Solutions (choose one):**

#### Option A: Update Node.js (Recommended)
```powershell
# Download and install Node.js 20.19.4 or later from:
# https://nodejs.org/

# After installation, verify:
node --version
# Should show v20.19.4 or higher
```

#### Option B: Continue with Current Version
The warnings are not critical errors. The app will likely work fine with Node.js v20.15.0. 
The warnings indicate potential compatibility issues, but React Native 0.81.4 works with Node 20.15.0.

To suppress these warnings during development:
```powershell
$env:NPM_CONFIG_ENGINE_STRICT="false"
npm run dev
```

### Issue 3: Missing Environment Variables

**Problem:** App crashes with Supabase connection errors.

**Solution:**
1. Copy `.env.example` to `.env` (already done):
   ```powershell
   copy .env.example .env
   ```

2. Edit `.env` file with your actual Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

3. Get your credentials from: https://app.supabase.com/project/_/settings/api

## 🎯 Quick Start Steps for Windows

### 1. First Time Setup
```powershell
# Navigate to project
cd C:\Users\ciora\Documents\GitHub\truxel

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your Supabase credentials

# Start development server
npm run dev
```

### 2. Daily Development Workflow
```powershell
# Always navigate to project first
cd C:\Users\ciora\Documents\GitHub\truxel

# Start development server
npm run dev

# In the Expo CLI, press:
# 'a' for Android emulator
# 'i' for iOS simulator (requires macOS)
# 'w' for web browser
```

## 📱 Testing on Physical Device

### Option 1: Expo Go App (Easiest)
1. Install **Expo Go** from Google Play Store or Apple App Store
2. Make sure your phone and computer are on the same WiFi network
3. Run `npm run dev` on your computer
4. Scan the QR code with:
   - **Android:** Expo Go app
   - **iOS:** Camera app (opens in Expo Go)

### Option 2: Development Build
```powershell
# For Android
npx expo run:android

# For iOS (requires macOS)
npx expo run:ios
```

## 🔧 Troubleshooting Commands

### Clear Cache and Restart
```powershell
# Clear Expo cache
npx expo start -c

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -r node_modules
npm install
```

### Check Installation
```powershell
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Expo CLI
npx expo --version

# Verify project structure
dir  # Should see: package.json, app/, components/, etc.
```

### TypeScript Errors
```powershell
# Check for TypeScript errors
npm run typecheck

# If you see module resolution errors, restart TypeScript server in VS Code:
# Press Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

## 🛠️ Development Tools Setup

### Recommended VS Code Extensions
- **React Native Tools** - Microsoft
- **Expo Tools** - Expo
- **ESLint** - Microsoft
- **Prettier** - Prettier
- **TypeScript Vue Plugin (Volar)** - Vue

### Android Studio Setup (for Android Emulator)
1. Download Android Studio: https://developer.android.com/studio
2. Install Android SDK
3. Create a virtual device (AVD)
4. Start emulator before running `npm run android`

## 📊 Available Scripts

```powershell
npm run dev              # Start development server
npm run android          # Start with Android emulator
npm run ios              # Start with iOS simulator (macOS only)
npm run web              # Start web version
npm run typecheck        # Check TypeScript errors
npm run lint             # Run ESLint
npm run build:web        # Build for web production
```

## 🔐 Environment Variables Reference

Create a `.env` file in the project root with:

```env
# Required - Get from Supabase Dashboard
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional - For enhanced maps experience
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
```

## ❓ Still Having Issues?

### Check Project Structure
Your project should have this structure:
```
truxel/
├── app/              ✅ Main application code
├── components/       ✅ Reusable UI components
├── services/         ✅ API services
├── store/           ✅ State management
├── types/           ✅ TypeScript types
├── .env             ✅ Environment variables (you need to create this)
├── package.json     ✅ Dependencies
└── app.json         ✅ Expo configuration
```

### Contact Support
If problems persist after following this guide:
1. Check the main README.md for additional documentation
2. Review error messages carefully
3. Ensure all prerequisites are installed
4. Verify Supabase credentials are correct

## 🚀 Production Build

### Android APK
```powershell
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build Android APK
eas build --platform android --profile preview
```

### iOS IPA (requires macOS and Apple Developer account)
```powershell
eas build --platform ios --profile preview
```

---

**Last Updated:** January 2025  
**Project Version:** 1.0.0  
**Expo SDK:** 54  
**React Native:** 0.81.4
