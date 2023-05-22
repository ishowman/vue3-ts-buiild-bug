import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({ 
      imports: [
        // presets
        'vue',
        'vue-router',
      ],
      eslintrc: {
        enabled: true, // Default `false`
        filepath: './configs/.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
      },
     }),
     Components({
    }),

  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
