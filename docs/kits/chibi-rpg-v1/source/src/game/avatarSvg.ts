/**
 * Turns the catalog-only SVG rendered by React into a Phaser-loadable data
 * URL. Keeping this bridge in the game layer lets scenes consume the shared
 * avatar artwork without importing React into Phaser.
 */
export function serializeAvatarSvg(svg: SVGSVGElement): string {
  const markup = new XMLSerializer().serializeToString(svg)

  const bytes = new TextEncoder().encode(markup)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return `data:image/svg+xml;base64,${btoa(binary)}`
}

export function collectAvatarSvgUrls(root: HTMLElement): Record<string, string> {
  const urls: Record<string, string> = {}

  root.querySelectorAll<HTMLElement>('[data-avatar-key]').forEach((source) => {
    const key = source.dataset.avatarKey
    const svg = source.querySelector('svg')

    if (key && svg) {
      urls[key] = serializeAvatarSvg(svg)
    }
  })

  return urls
}
