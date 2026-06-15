import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.halo.taskmanager",
  appName: "Halo",
  webDir: "out",
  server: {
    androidScheme: "https"
  },
  plugins: {
    AdMob: {
      appId: "ca-app-pub-3940256099942544~3347511713",
      initializeForTesting: true
    }
  }
};

export default config;
