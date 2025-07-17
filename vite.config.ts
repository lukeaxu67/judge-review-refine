import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';
  const isProd = command === 'build';
  
  console.log(`🚀 Vite running in ${command} mode (${mode})`);
  
  return {
    server: {
      host: "::",
      port: 8080,
      // 开发环境代理API请求到后端
      proxy: isDev ? {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        }
      } : undefined,
    },
    
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    
    // 基础路径
    base: '/',
    
    // 构建配置
    build: {
      // 默认输出目录
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDev,
      // 生产环境优化
      minify: isProd ? 'terser' : false,
      rollupOptions: {
        output: {
          // 分包策略，优化加载性能
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-toast'],
            'chart-vendor': ['recharts'],
            'utils-vendor': ['xlsx', 'katex'],
          },
        },
      },
    },
    
    // 预览服务器配置
    preview: {
      port: 8080,
      host: "::",
    }
  };
});
