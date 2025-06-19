import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";
import { basename } from "path";

// 👇 Add this plugin inline
function mediapipe_workaround() {
  return {
    name: 'mediapipe_workaround',
    load(id: string) {
      const file = basename(id);
      if (file === 'selfie_segmentation.js') {
        let code = fs.readFileSync(id, 'utf-8');
        code += '\nexports.SelfieSegmentation = SelfieSegmentation;';
        return { code };
      }
      if (file === 'pose.js') {
        let code = fs.readFileSync(id, 'utf-8');
        code += '\nexports.Pose = Pose;';
        return { code };
      }
      if (file === 'holistic.js') {
        let code = fs.readFileSync(id, 'utf-8');
        code += '\nexports.Holistic = Holistic;';
        return { code };
      }
      if (file === 'hand.js' || file === 'hands.js') {
        let code = fs.readFileSync(id, 'utf-8');
        code += '\nexports.Hands = Hands;';
        return { code };
      }
      return null;
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mediapipe_workaround() // 👈 Include here
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
