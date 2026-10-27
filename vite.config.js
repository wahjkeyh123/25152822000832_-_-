import { defineConfig } from 'vite';

/**
 * 打包配置。
 * base 用相对路径，这样 dist 文件夹交给别人时，不依赖网站挂在哪个地址。
 * 评审运行：npm install → npm run build → npm run preview
 */
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: false,
    // Windows 上替换图标时，文件会被短暂锁住。轮询不会因此把开发服务器打掉。
    watch: {
      usePolling: true,
      interval: 400,
    },
  },
});
