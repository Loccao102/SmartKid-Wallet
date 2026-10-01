import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import { TeacherApp } from './teacher/TeacherApp'
import { ParentApp } from './parent/ParentApp'
import './styles.css'
import './production-ui.css'
import './shopping-ui.css'
import './design-system.css'
import './work-ui.css'
import './screen-ui.css'
import './avatar-ui.css'
import './bank-ui.css'
import './restaurant-ui.css'
import './market-ui.css'
import './world-chapter-ui.css'
import './teacher-ui.css'
import './classroom-ui.css'
import './parent-ui.css'

const queryClient = new QueryClient()

function resetDemoStorageFromUrl() {
  const url = new URL(window.location.href)
  if (url.searchParams.get('reset') !== '1') return false

  const shouldRemove = (key: string) =>
    key.startsWith('smartkid-wallet-') ||
    key.startsWith('smartkid-weekly-')

  for (const storage of [window.localStorage, window.sessionStorage]) {
    const keys = Array.from({ length: storage.length }, (_, index) =>
      storage.key(index),
    ).filter((key): key is string => Boolean(key))

    for (const key of keys) {
      if (shouldRemove(key)) storage.removeItem(key)
    }
  }

  url.searchParams.delete('reset')
  window.location.replace(url.toString())
  return true
}

if (!resetDemoStorageFromUrl()) {
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {window.location.pathname.startsWith('/teacher') ? (
        <TeacherApp />
      ) : window.location.pathname.startsWith('/parent') ? (
        <ParentApp />
      ) : (
        <App />
      )}
    </QueryClientProvider>
  </StrictMode>,
)
}
