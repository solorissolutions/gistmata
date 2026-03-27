import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.join(projectRoot, "src");

const config = {
  plugins: {
    "@tailwindcss/postcss": {
      // Tailwind v4 source detection was scanning the entire repo, including
      // non-app artifacts in the workspace. Restrict scanning to src/ so the
      // generated utility sheet only reflects real UI code.
      base: sourceRoot,
      optimize: false,
    },
  },
};

export default config;
