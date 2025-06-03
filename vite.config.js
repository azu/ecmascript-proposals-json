import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Vite設定 - ParcelからViteへの移行
export default defineConfig({
  plugins: [vue()],
  
  // ルートディレクトリをwebsiteに設定
  root: './website',
  
  // ビルド設定
  build: {
    outDir: '../dist', // プロジェクトルートからの相対パス
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'website/index.html')
    },
    // 静的ファイルのコピー設定
    copyPublicDir: true
  },
  
  // 開発サーバー設定
  server: {
    port: 1234, // Parcelのデフォルトポートと同じに設定
    open: true
  },
  
  // 静的ファイルの設定
  publicDir: '../static',
  
  // CommonJSモジュールの互換性のため
  define: {
    global: 'globalThis',
    'process.env': '{}',
    'process.env.NODE_ENV': '"development"'
  },
  
  // Node.jsポリフィルの設定（Parcelから移行する際に必要）
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
      events: 'events',
      stream: 'stream-browserify',
      os: 'os-browserify'
    }
  },
  
  // 依存関係の最適化設定
  optimizeDeps: {
    include: ['process', 'buffer']
  },
  
  // プリビュー時のベースパス設定
  base: './'
})
