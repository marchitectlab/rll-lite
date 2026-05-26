# R.L.L Lite — Android Build Instructions

## Prerequisites

Install these on your computer before starting:

1. **Node.js** (v18+) — https://nodejs.org
2. **Android Studio** — https://developer.android.com/studio
   - During install, make sure to include: Android SDK, Android SDK Platform, Android Virtual Device
3. **Java JDK 17** — usually bundled with Android Studio

---

## Step 1: Set up environment variables (optional)

Create a `.env` file in the project root with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> Without these the app still launches — credentials are already baked in as fallbacks — but a `.env` lets you override them cleanly.

---

## Step 2: Install dependencies

```bash
npm install
```

---

## Step 3: Build the web app

```bash
npm run build
```

---

## Step 4: Sync into Android

```bash
npm run cap:sync
```

---

## Step 5: Set up release signing ⬅ required for Play Store

1. Copy the signing template:

   ```bash
   cp android/keystore.properties.example android/keystore.properties
   ```

2. Edit `android/keystore.properties` with your production keystore details:

   ```
   storeFile=../my-release-key.jks     # path relative to the android/ folder
   storePassword=your_keystore_password
   keyAlias=your_key_alias
   keyPassword=your_key_password
   ```

3. Place your `.jks` / `.keystore` file at the path you specified.

> **Security:** `android/keystore.properties` is in `.gitignore` — it is never committed to git.

---

## Building

### Release AAB (Google Play upload)

Open Android Studio (`npm run cap:open`), wait for Gradle sync, then:

- **Build → Generate Signed Bundle / APK → Android App Bundle → Next**
- Select your keystore, alias, and passwords → **Finish**
- Output: `android/app/build/outputs/bundle/release/app-release.aab`

Or from the command line (requires `android/local.properties` with your SDK path):

```bash
cd android && ./gradlew bundleRelease
```

### Release APK (sideloading)

```bash
cd android && ./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### Debug APK (testing)

- Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- Output: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## RevenueCat Setup

The app uses API key `test_maMzaOVNlYsFIMLkAteqNDwlERW` (test mode).

### For production, replace it in `lib/revenuecat.ts`:

```typescript
export const REVENUECAT_API_KEY = 'your_android_production_key';
```

### RevenueCat Dashboard:
1. Create an **Entitlement** with identifier: `pro`
2. Create products in Google Play Console (Monthly / Lifetime)
3. Create an **Offering** with both packages attached
4. Link your Google Play app under **App settings**

---

## App Icon

Custom R.L.L icon applied at all required sizes:
`mipmap-mdpi` (48px), `mipmap-hdpi` (72px), `mipmap-xhdpi` (96px), `mipmap-xxhdpi` (144px), `mipmap-xxxhdpi` (192px)

Adaptive icon background: `#020617`

---

## Troubleshooting

**App shows blank / white screen**
- Make sure you ran `npm install` (which now includes `@revenuecat/purchases-capacitor`)
- Then `npm run build && npm run cap:sync`
- Older builds had RevenueCat excluded from the bundle — this is fixed

**"SDK location not found"**
- Create `android/local.properties`:
  ```
  sdk.dir=/path/to/Android/sdk
  ```

**Gradle sync fails with "Could not resolve :purchases-capacitor"**
- Run `npm install` first, then `npm run cap:sync` before opening Android Studio

**Build fails with Java version error**
- Use JDK 17: **File → Project Structure → SDK Location → JDK Location**

**RevenueCat shows no offerings**
- Offerings only load with a production key + live Google Play products linked in RC dashboard

**Signing fails or AAB is unsigned**
- Follow Step 5 above and make sure `android/keystore.properties` exists with correct paths
