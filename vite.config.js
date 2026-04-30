// vite.config.js (النسخة النهائية والمبسطة للعمل المحلي)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // هذا الجزء يحل مشكلة ENOSPC (System limit for file watchers reached)
    watch: {
      ignored: [
        '**/.git/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/functions/**', // تجاهل مجلد Firebase Functions
        '**/y/**',       // تجاهل أي مجلدات أخرى كبيرة غير ضرورية
      ],
    },
  },
});
