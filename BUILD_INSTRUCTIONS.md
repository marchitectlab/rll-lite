# R.L.L Lite — Android Build Instructions

## Prerequisites

Install these on your computer before starting:

1. **Node.js** (v18+) — https://nodejs.org
2. **Android Studio** — https://developer.android.com/studio
   - During install, make sure to include: Android SDK, Android SDK Platform, Android Virtual Device
3. **Java JDK 17** — usually bundled with Android Studio

After installing Android Studio, open it once and let it finish downloading SDK components.

---

## Step 1: Set up environment variables

Create a `.env` file in this folder (`rll-app/`) with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> Get these from your Supabase project dashboard at https://supabase.com → Project Settings → API.
> Without them the app still launches, but users cannot sign in.

---

## Step 2: Install dependencies

Open a terminal in the `rll-app/` folder and run:

```bash
npm install
```

---

## Step 3: Build the web app

```bash
npm run build
```

This creates a `dist/` folder with the compiled app.

---

## Step 4: Sync the web build into Android

```bash
npm run cap:sync
```

This copies `dist/` into the Android project and registers all plugins including RevenueCat.

---

## Step 5: Open in Android Studio

```bash
npm run cap:open
```

Android Studio will open the project. Wait for the Gradle sync to finish (progress bar at the bottom).

---

## Building the APK

Once Android Studio is open and Gradle sync is done:

**Debug APK (for testing):**
- Go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- Find the output at: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release AAB (for Google Play):**
- Go to **Build → Generate Signed Bundle / APK**
- Choose **Android App Bundle**, create or select a keystore, and follow the wizard
- Output at: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Installing on Your Phone (sideloading APK)

1. On your Android phone, go to **Settings → Security** → enable **"Install unknown apps"**
2. Transfer the APK to your phone (USB, email, Google Drive, etc.)
3. Open the APK file on your phone and tap **Install**

---

## RevenueCat Setup

The app is pre-integrated with RevenueCat using **test key** `test_maMzaOVNlYsFIMLkAteqNDwlERW`.

### For production, replace the key in `lib/revenuecat.ts`:
```typescript
export const REVENUECAT_API_KEY = 'appl_XXXXXX'; // your real Android key
```

### In the RevenueCat Dashboard (https://app.revenuecat.com):
1. Create an **Entitlement** with identifier: `pro`
2. Create a **Monthly** product ($0.99) and **Lifetime** product ($4.99) in Google Play Console
3. Create an **Offering** with both packages attached
4. Link your Google Play app in RevenueCat → **App settings**

### How purchases work:
- On Android: Real RevenueCat purchase flow via Google Play
- On web / dev: "Upgrade to Pro" activates immediately (no payment) — for development only

---

## App Icon

Custom R.L.L icon has been applied at all required sizes:
- `mipmap-mdpi` — 48×48 px
- `mipmap-hdpi` — 72×72 px
- `mipmap-xhdpi` — 96×96 px
- `mipmap-xxhdpi` — 144×144 px
- `mipmap-xxxhdpi` — 192×192 px

Adaptive icon background color: `#020617` (dark navy, matching the app theme)

---

## Crash Prevention

The following issues were handled to ensure the app does not crash on launch:

- **Missing Supabase env vars** — falls back to placeholder values, no crash
- **RevenueCat on web** — all calls gated behind `Capacitor.isNativePlatform()`, no crash
- **AdMob on web** — only initialized on native platform, no crash

---

## Troubleshooting

**"SDK location not found"**
- Create `android/local.properties` with:
  ```
  sdk.dir=/path/to/your/Android/sdk
  ```
  (e.g., `/Users/you/Library/Android/sdk` on macOS, `C:\Users\you\AppData\Local\Android\Sdk` on Windows)

**Gradle sync fails with "Could not resolve :purchases-capacitor"**
- Make sure you ran `npm install` first, then `npm run cap:sync` before opening Android Studio

**Build fails with Java version error**
- Make sure you're using JDK 17 (not 21+)
- In Android Studio: **File → Project Structure → SDK Location → JDK Location**

**App shows login screen and auth doesn't work**
- Make sure `.env` has the correct Supabase URL and anon key, then re-run `npm run build && npm run cap:sync`

**RevenueCat shows no offerings in the app**
- Offerings only load after linking Google Play products in the RevenueCat dashboard with a production API key
- The test key (`test_maMzaOVNlYsFIMLkAteqNDwlERW`) shows the paywall UI but won't load live product prices
