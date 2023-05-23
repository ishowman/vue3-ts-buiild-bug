import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
// import vueJsx from '@vitejs/plugin-vue-jsx';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import * as path from 'path';

// https://vitejs.dev/config/

export default defineConfig(({ command, mode }) => {
  const CONFIG_DIR = path.resolve(__dirname, 'configs');

  const ENVS = loadEnv(mode, CONFIG_DIR);
  const baseConfig = {
    plugins: [
      vue(),
      // vueJsx(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        eslintrc: {
          enabled: true, // Default `false`
          filepath: './configs/.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
        },
        // cache: './configs/types-cache.json',
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    resolve: {
      // alias: {
      //   '@': path.resolve(__dirname, 'src'),
      //   '@public': path.resolve(__dirname, 'public'),
      // },
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@public': fileURLToPath(new URL('./public', import.meta.url)),
      },
    },
    define: {
      // use config vars of heroku
      VITE_API_PREFIX: JSON.stringify(process.env.VITE_API_PREFIX),
    },

    css: {
      postcss: './configs/.postcssrc.yml',
    },
    envDir: CONFIG_DIR,
  };
  if (command === 'serve') {
    return {
      ...baseConfig,
      server: {
        watch: {
          usePolling: true, // wsl2
        },
        proxy: {
          '/plus': {
            // localhost/plus 开头的请求，会替换为 target 指定的域名
            target: ENVS.VITE_DEV_API_HOST,
            changeOrigin: true,
          },
        },
      },
    };
  } else if (command === 'build') {
    return {
      ...baseConfig,
      esbuild: { pure: ['console.log'], minify: true },
    };
  }
});
