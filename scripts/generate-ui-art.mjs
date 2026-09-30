// Original, deterministic artwork. No interface text or interaction is baked into art.
// Run with node scripts/generate-ui-art.mjs to reproduce the SVG assets.
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const root = resolve(import.meta.dirname, '../public/assets/production')
mkdirSync(root, { recursive: true })
const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`
const save = (name, w, h, body) =>
  writeFileSync(resolve(root, `${name}.svg`), svg(w, h, body))
const tree = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="32" rx="24" ry="9" fill="#2c7562" opacity=".14"/><path d="M0 30V-7" stroke="#9b7350" stroke-width="7"/><path d="M0 12L-12 1M1 3L12-7" stroke="#9b7350" stroke-width="4"/><path d="M0-52C-19-52-33-32-28-12C-45 13-14 26 0 14C20 26 41 6 26-13C31-32 19-52 0-52" fill="#399a71"/><path d="M-6-45C-24-40-26-22-18-10C-31 2-14 15-5 7C10 8 16-5 6-16C17-28 7-46-6-45" fill="#68b97b"/></g>`
const plant = (x, y) =>
  `<g transform="translate(${x} ${y})"><path d="M-12 0H12L9 19H-9Z" fill="#d78857"/><path d="M0 2C-28-4-16-28-1-9C5-35 27-21 6-3C26-12 27 7 0 2" fill="#328967"/></g>`
const windows = (x, y, n, color = '#8bcecf') =>
  Array.from(
    { length: n },
    (_, i) =>
      `<rect x="${x + i * 36}" y="${y}" width="28" height="44" rx="3" fill="${color}"/><path d="M${x + i * 36 + 4} ${y + 33}l17-26" stroke="#dcf3de" stroke-width="5" opacity=".65"/>`,
  ).join('')
const base = `<ellipse cx="190" cy="246" rx="172" ry="32" fill="#276f64" opacity=".12"/><path d="M20 205Q190 139 360 205V227Q190 301 20 227Z" fill="#c7aa76"/><ellipse cx="190" cy="204" rx="170" ry="48" fill="#9bc67b"/><ellipse cx="190" cy="203" rx="141" ry="34" fill="#ede2b4"/>`
save(
  'smartmart',
  380,
  285,
  `${base}<path d="M79 92L261 64L310 92V201L128 230L79 201Z" fill="#efce96"/><path d="M261 65L310 92V201L261 180Z" fill="#d3ad7a"/><path d="M73 85L258 54L319 86L133 119Z" fill="#197c6a"/><path d="M73 85V104L133 138V119Z" fill="#0f655b"/><path d="M133 119L319 86V105L133 138Z" fill="#409b73"/><path d="M127 158L314 126V153L127 187Z" fill="#fff7db"/><path d="M127 158L314 126L300 111L116 142Z" fill="#e2684c"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${130 + i * 30} ${140 - i * 5}l15-3 13 15-15 3Z" fill="#fff3cf"/>`).join('')}<path d="M148 179L190 172V216L148 223Z" fill="#77bdbe"/><path d="M198 171L239 164V208L198 215Z" fill="#327f7c"/><path d="M203 175L234 170V202L203 208Z" fill="#afe0da"/><path d="M249 163L291 156V200L249 207Z" fill="#77bdbe"/><path d="M83 121L115 139V191L83 174Z" fill="#a1d8d2"/><path d="M148 129L296 103V125L148 151Z" fill="#fff6d7"/>${plant(132, 220)}${plant(305, 197)}${tree(44, 157, 0.7)}${tree(337, 160, 0.65)}<path d="M190 235L228 230L265 255L221 267Z" fill="#fff3d5"/><g transform="translate(264 66)"><circle r="27" fill="#fff6d7" stroke="#edbd4f" stroke-width="6"/><path d="M-15-9h5l5 18h18l5-14H-9M-3 0h18M1-7v14M9-7v14" fill="none" stroke="#197c6a" stroke-width="3"/><circle cx="-2" cy="15" r="3" fill="#197c6a"/><circle cx="12" cy="15" r="3" fill="#197c6a"/></g>`,
)
save(
  'tiny-bank',
  380,
  285,
  `${base}<path d="M96 110L265 89L299 108V199L131 222L96 205Z" fill="#c3c8b5"/><path d="M84 105L199 43L310 89L191 118Z" fill="#849e99"/><path d="M104 100L200 59L286 87L192 107Z" fill="#e5e3ca"/><circle cx="198" cy="84" r="12" fill="#c4b88e"/>${[130, 174, 218, 262].map((x, i) => `<path d="M${x} ${120 - i * 6}v77l17-2v-77Z" fill="#f9f3da"/><path d="M${x - 5} ${116 - i * 6}l27-4v9l-27 4Z" fill="#d9d9bf"/>`).join('')}<path d="M114 205L291 181V204L114 231Z" fill="#a9b2a0"/>${tree(56, 157, 0.75)}${plant(310, 208)}`,
)
save(
  'happy-restaurant',
  380,
  285,
  `${base}<path d="M100 116L244 89L300 117V207L152 232L100 207Z" fill="#f2d4a2"/><path d="M86 115L164 45L318 107L152 145Z" fill="#d98166"/><path d="M164 45L238 31L318 107Z" fill="#b85e51"/><path d="M152 155L300 129V163L152 190Z" fill="#faf2d1"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M${153 + i * 30} ${155 - i * 5.3}l15-3v35l-15 3Z" fill="#d98166"/>`).join('')}<path d="M173 188l36-7v40l-36 6Z" fill="#71aeac"/><path d="M229 178l41-7v30l-41 7Z" fill="#79bcb5"/>${tree(53, 153, 0.75)}${plant(304, 209)}<ellipse cx="96" cy="211" rx="24" ry="10" fill="#fff1ce"/><path d="M96 217v18" stroke="#a48061" stroke-width="5"/>`,
)
save(
  'weekend-market',
  380,
  285,
  `${base}${tree(309, 129, 0.85)}${[0, 1].map((i) => `<g transform="translate(${76 + i * 117} ${120 - i * 20})"><path d="M0 0L71-15L109 8L35 25Z" fill="${i ? '#d99859' : '#78ad97'}"/><path d="M0 0V14L35 40V25Z" fill="#f9ebc7"/><path d="M35 25L109 8V22L35 40Z" fill="#faf2d9"/><path d="M8 21v58M101 30v44M38 45v55" stroke="#987b50" stroke-width="6"/><path d="M3 76l71-15 33 15-69 21Z" fill="#e3b97a"/><path d="M38 97l69-21v21l-69 21Z" fill="#b8885d"/>${[0, 1, 2, 3].map((j) => `<circle cx="${35 + j * 15}" cy="${74 - j * 2}" r="9" fill="${j % 2 ? '#e9b448' : '#dd8064'}"/>`).join('')}</g>`).join('')}${plant(322, 218)}`,
)
// Reusable booth architecture, with stall-specific merchandise silhouettes.
for (const [id, color, kind] of [
  ['produce', '#4a9966', 0],
  ['food', '#d37b51', 1],
  ['drinks', '#4797b2', 2],
  ['supplies', '#c69843', 3],
  ['promotion', '#a26a8f', 4],
]) {
  const merchandise = Array.from({ length: 12 }, (_, i) => {
    const x = 81 + (i % 6) * 28,
      y = 145 + Math.floor(i / 6) * 35
    if (kind === 0)
      return `<ellipse cx="${x}" cy="${y}" rx="11" ry="10" fill="${['#dd6a45', '#e2af45', '#77a344'][i % 3]}"/><path d="M${x} ${y - 9}q-5-9 5-7" fill="none" stroke="#417947" stroke-width="3"/>`
    if (kind === 1)
      return `<path d="M${x - 10} ${y + 8}v-12q10-21 20 0v12Z" fill="${i % 2 ? '#e7b65b' : '#ad744a'}"/><path d="M${x - 5} ${y - 4}l5-4m0 10l5-4" stroke="#f7d593" stroke-width="3"/>`
    if (kind === 2)
      return `<path d="M${x - 5} ${y - 15}h10v7l5 6v15h-20v-15l5-6Z" fill="${i % 2 ? '#85c3cd' : '#eab669'}"/><path d="M${x - 5} ${y - 15}h10" stroke="#377f92" stroke-width="5"/><path d="M${x - 8} ${y}h16v7h-16Z" fill="#fff3d6"/>`
    if (kind === 3)
      return `<rect x="${x - 10}" y="${y - 14}" width="20" height="28" rx="3" fill="${i % 2 ? '#72a5aa' : '#dfb66c'}"/><path d="M${x - 6} ${y - 13}v26" stroke="#fff0c9" stroke-width="3"/>`
    return `<path d="M${x - 12} ${y - 12}h16l10 13-17 16-14-14Z" fill="${i % 2 ? '#ce7a6b' : '#d6b260'}"/><circle cx="${x - 5}" cy="${y - 5}" r="2" fill="#fff5dd"/>`
  }).join('')
  save(
    `stall-${id}`,
    320,
    250,
    `<ellipse cx="160" cy="224" rx="145" ry="24" fill="#537b58" opacity=".13"/><path d="M48 94H253V205H48Z" fill="#bd9060"/><path d="M253 94l25-16v116l-25 11Z" fill="#9e764e"/><path d="M56 99H247V186H56Z" fill="#725d40"/><path d="M39 197H258V227H39Z" fill="#c79964"/><path d="M258 197l24-15v30l-24 15Z" fill="#a67b4c"/>${merchandise}<path d="M58 166H250M58 199H250" stroke="#e1b77e" stroke-width="8"/><path d="M50 70v133M253 70v133" stroke="#ad8055" stroke-width="9"/><path d="M35 89L57 44H241L273 89Z" fill="${color}"/>${[0, 1, 2, 3].map((i) => `<path d="M${77 + i * 43} 44h21l${6 + i * 2} 45h-27Z" fill="#fff4d6"/>`).join('')}<path d="M35 89H273V100Q260 116 246 100Q231 116 216 100Q201 116 186 100Q171 116 156 100Q141 116 126 100Q111 116 96 100Q81 116 66 100Q50 116 35 100Z" fill="${color}"/><rect x="89" y="22" width="132" height="35" rx="9" fill="#fff1cd" stroke="#b28552" stroke-width="4"/><path d="M117 36h76M131 44h48" stroke="${color}" stroke-width="4" stroke-linecap="round"/>${plant(24, 206)}${plant(292, 204)}`,
  )
}
save(
  'student',
  160,
  190,
  `<ellipse cx="80" cy="178" rx="38" ry="9" fill="#326f60" opacity=".14"/><path d="M59 140l-7 33h22l8-31M87 141l4 32h23l-10-37" fill="#2b5770"/><path d="M49 175q13-8 27-1v9H46ZM89 175q14-8 28 0v8H89Z" fill="#fff6dd" stroke="#30566a" stroke-width="3"/><rect x="44" y="89" width="68" height="55" rx="18" fill="#e5b449"/><path d="M58 91q21-11 44 0l10 53H49Z" fill="#3b94ae"/><path d="M64 94l15 15 18-15" fill="#fff7db"/><path d="M48 104l-13 28q-3 9 6 12q7 2 10-7l9-25M106 103l12 17q5 7 10 1l9-13" fill="none" stroke="#efba89" stroke-width="13" stroke-linecap="round"/><circle cx="80" cy="57" r="38" fill="#efba89"/><path d="M42 59C28 11 65 6 76 17C106-2 131 25 116 61L105 43Q79 55 68 35Q59 53 42 59" fill="#594337"/><path d="M46 32Q60 9 77 24Q94 8 108 27" fill="none" stroke="#78563e" stroke-width="7" stroke-linecap="round"/><path d="M62 63v3M93 63v3" stroke="#423e35" stroke-width="5" stroke-linecap="round"/><path d="M72 78q9 7 17-1" fill="none" stroke="#a25d46" stroke-width="3" stroke-linecap="round"/><circle cx="54" cy="74" r="5" fill="#e69b7b"/><circle cx="101" cy="74" r="5" fill="#e69b7b"/>`,
)
save(
  'world-landscape',
  1200,
  730,
  `<defs><pattern id="ripples" width="70" height="50" patternUnits="userSpaceOnUse"><path d="M8 22h19m15 16h10" stroke="#c2e8dd" stroke-width="3" stroke-linecap="round" opacity=".5"/></pattern></defs><rect width="1200" height="730" fill="#acd9d2"/><rect width="1200" height="730" fill="url(#ripples)"/><path d="M-20 28Q180-44 360 35T736 24T1210 49V201Q1040 242 935 189T655 211T331 192T-20 249Z" fill="#cee4b0"/><path d="M-60 210Q40 109 213 144T435 255Q475 340 424 389T91 424Q-56 411-60 210" fill="#6da786"/><path d="M-60 191Q40 90 213 125T435 236Q475 321 424 370T91 405Q-56 392-60 191" fill="#bcd795"/><path d="M700 154Q962 73 1189 174L1250 338Q1088 425 802 381Q633 365 664 275Z" fill="#72ac8b"/><path d="M700 137Q962 56 1189 157L1250 321Q1088 408 802 364Q633 348 664 258Z" fill="#cadfa4"/><path d="M17 503Q218 400 428 488Q529 554 471 680L402 759H-30Z" fill="#74ae88"/><path d="M17 485Q218 382 428 470Q529 536 471 662L402 741H-30Z" fill="#c5dca0"/><path d="M713 494Q905 385 1179 487L1240 739H704Q616 631 713 494" fill="#b9d497"/><path d="M202 275Q421 323 509 286Q610 257 778 278M520 285Q554 441 438 554M564 408Q627 457 796 562" fill="none" stroke="#709f7c" stroke-width="55"/><path d="M202 269Q421 317 509 280Q610 251 778 272M520 279Q554 435 438 548M564 402Q627 451 796 556" fill="none" stroke="#f1dfac" stroke-width="46"/><path d="M456 291l98-13M483 402l97 18M637 475l-28 49" stroke="#bb9363" stroke-width="59"/><path d="M456 291l98-13M483 402l97 18M637 475l-28 49" stroke="#e5bc80" stroke-width="47"/><path d="M463 270l5 40m12-42l5 39m12-41l5 39m12-41l5 40m12-42l5 39M500 391l-7 33m23-30l-7 33m23-30l-7 33m23-30l-7 33" stroke="#a87f54" stroke-width="3"/>${[
    [36, 137, 1.1],
    [109, 99, 0.7],
    [404, 151, 0.8],
    [376, 387, 0.7],
    [48, 383, 0.9],
    [688, 110, 0.65],
    [1063, 121, 0.9],
    [1177, 339, 1.1],
    [993, 396, 0.6],
    [63, 516, 0.9],
    [432, 658, 0.9],
    [713, 633, 0.7],
    [1140, 630, 1.3],
    [824, 461, 0.65],
    [183, 690, 0.7],
    [574, 85, 0.7],
    [544, 650, 0.8],
  ]
    .map((t) => tree(...t))
    .join(
      '',
    )}<g fill="#fff8d7"><ellipse cx="1036" cy="617" rx="32" ry="9"/><path d="M1037 551v62h39Z"/><path d="M1030 566v42h-27Z"/></g><path d="M1001 617h72l-17 16h-37Z" fill="#b08057"/>`,
)
save(
  'hub-floor',
  1200,
  780,
  `<defs><pattern id="tiles" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M0 0h100v100H0Z" fill="#f6e8bd"/><path d="M0 0h50v50H0ZM50 50h50v50H50Z" fill="#f3e0ae"/></pattern></defs><rect width="1200" height="780" fill="url(#tiles)"/><path d="M0 0h1200v105H0Z" fill="#d6e8cc"/><path d="M80 0v95M270 0v95M460 0v95M740 0v95M930 0v95M1120 0v95" stroke="#fff8de" stroke-width="22"/><path d="M0 100h1200" stroke="#92bda0" stroke-width="12"/><path d="M600 100v650M100 360h1000" stroke="#fff5d6" stroke-width="110"/><ellipse cx="600" cy="381" rx="115" ry="57" fill="#bbcd92"/><ellipse cx="600" cy="374" rx="98" ry="44" fill="#fef6d8"/><ellipse cx="600" cy="372" rx="70" ry="28" fill="#acd3c0"/>${[
    [50, 148, 1],
    [1144, 145, 1],
    [55, 486, 0.9],
    [1134, 501, 0.9],
    [282, 684, 0.7],
    [928, 698, 0.7],
  ]
    .map((t) => tree(...t))
    .join('')}`,
)
