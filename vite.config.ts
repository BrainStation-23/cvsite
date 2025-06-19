import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { basename } from "path";
import { componentTagger } from "lovable-tagger";

// 👇 MediaPipe export fix plugin
function mediapipeWorkaround() {
  const exportMap: Record<string, string> = {
    'selfie_segmentation.js': 'SelfieSegmentation',
    'pose.js': 'Pose',
    'holistic.js': 'Holistic',
    'hands.js': 'Hands',
  };

  return {
    name: 'mediapipe-export-fix',
    load(id: string) {
      const file = basename(id);
      const exportSymbol = exportMap[file];
      if (exportSymbol) {
        try {
          const code = fs.readFileSync(id, 'utf-8');
          return { code: `${code}\nexports.${exportSymbol} = ${exportSymbol};` };
        } catch (error) {
          console.warn(`⚠️ Failed to patch MediaPipe file: ${file}`, error);
        }
      }
      return null;
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [".lovableproject.com"],
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mediapipeWorkaround()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
