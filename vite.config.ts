import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Editors and automation replace files through sidecar directories such as
      // "src/.screen-ui.css.<pid>.<uuid>.tmpdir/". Watching those makes the dev
      // server die with EBUSY on Windows even though the real file is fine.
      // Nothing here needs hot reloading, so keep the watcher off it.
      ignored: ['**/scripts/**', '**/.*.tmpdir/**'],
    },
  },
})
