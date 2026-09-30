const STORAGE_KEY = 'smartkid-weekly-variant-key-v1'

function createVariantKey() {
  if (
    typeof globalThis.crypto !== 'undefined' &&
    'randomUUID' in globalThis.crypto
  ) {
    return globalThis.crypto.randomUUID()
  }

  return (
    'variant-' +
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 12)
  )
}

export function getOrCreateWeeklyVariantKey() {
  if (typeof globalThis.localStorage === 'undefined') {
    return 'server-preview'
  }

  try {
    const existing = globalThis.localStorage.getItem(STORAGE_KEY)
    if (existing) return existing

    const created = createVariantKey()
    globalThis.localStorage.setItem(STORAGE_KEY, created)
    return created
  } catch {
    return createVariantKey()
  }
}
