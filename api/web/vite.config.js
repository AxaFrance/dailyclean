import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), 
    svgr({
    svgrOptions: {
      // svgr options
    }, 
      resolve: {
        // Workaround to fix inline dependency of a dependency
        mainFields: ['module'],
      },
  }),],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['json', 'lcov', 'text', 'clover', 'html'],
    },
    setupFiles: './tests/setup.js',
  },
})
