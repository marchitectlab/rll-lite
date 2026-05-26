import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rll.mobile',
  appName: 'R.L.L Lite',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
