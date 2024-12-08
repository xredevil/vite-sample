import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';
import fs from 'fs-extra';

// https://vite.dev/config/
export default defineConfig(() => {
  // Quét thư mục src/pages để lấy danh sách các thư mục (ví dụ: page01, page02)
  const pagesDir = resolve(__dirname, 'src/pages');
  
  // Lấy tất cả các thư mục con trong src/pages
  const pageDirs = fs.readdirSync(pagesDir).filter((file: string) => fs.statSync(resolve(pagesDir, file)).isDirectory());

  // Tạo cấu hình input Rollup tự động từ các thư mục con trong src/pages
  const input = Object.fromEntries(
    pageDirs.map((dir: string) => {
      const htmlPath = resolve(pagesDir, dir, `${dir}.html`);
      return [dir, htmlPath]; // Đưa file HTML vào input build
    })
  );

  return {
    plugins: [
      react(),
      {
        name: 'move-html-to-root',
        closeBundle: () => {
          const outputDir = 'dist';
          pageDirs.forEach((page: string) => {
            const srcPath = resolve(outputDir, `src/pages/${page}/${page}.html`);
            const destPath = resolve(outputDir, `${page}.html`);
            if (fs.existsSync(srcPath)) {
              fs.moveSync(srcPath, destPath, { overwrite: true }); // Di chuyển file HTML lên thư mục gốc
            }
          });
          // Cleanup thư mục không cần thiết (src/pages)
          fs.removeSync(resolve(outputDir, 'src'));
        },
      },
      {
        name: 'rewrite-middleware',
        configureServer(serve) {
          serve.middlewares.use((req, res, next) => {
            const match = req.url?.match(/^\/pages\/(.+)$/);
            if (match) {
              const pageName = match[1].replace('.html', '');
              req.url = `/src/pages/${pageName}/${pageName}.html`
            }
            // if (req.url?.startsWith('/pages/')) {
            //   req.url = req.url.replace(/^\/pages/, '/src/pages')
            // }
            next()
          })
        }
      },
    ],
    build: {
      rollupOptions: {
        input, // Sử dụng input được tạo tự động từ các thư mục
      },
      emptyOutDir: true,
    },
    server: {
      proxy: {
        '/pages/*': {
          target: 'http://localhost:5173',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/src/, ''),
        },
      },
    },
  };
});
