import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rll.mobile',
  appName: 'R.L.L Lite',
  webDir: 'dist',
  android: {
    buildOptions: {
      releaseType: 'APK',
    }
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
