import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.linksaver.app',
  appName: 'Link Base',
  webDir: 'public',
  server: {
    // IMPORTANT: Replace this URL with your actual deployed app URL (e.g., https://linksaver.vercel.app)
    // For local testing on emulator, you can use http://10.0.2.2:3000
    url: 'https://your-deployed-app-url.com',
    cleartext: true
  }
};

export default config;
