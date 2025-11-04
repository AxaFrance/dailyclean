import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        // svgr options
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      reporter: ["json", "lcov", "text", "clover", "html"],
    },
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.{idea,git,cache,output,temp}/**",
      "./storybook/**",
      "./public/**",
      "./tests/**",
      "./tests/**",
      "./**/*.stories.ts",
      "./**/*.spec.ts",
    ],
    setupFiles: "./tests/setup.ts",
  },
});
