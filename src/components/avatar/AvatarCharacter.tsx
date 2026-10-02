import type { AvatarAge, AvatarConfig, AvatarExpression } from '../../avatar/avatarCatalog'

/** Shared canvas ratio for portraits and rasterized Phaser textures. */
export const AVATAR_ART_SIZE = { width: 240, height: 300 } as const

export interface AvatarCharacterProps {
  config: AvatarConfig
  age?: AvatarAge
  expression?: AvatarExpression
  uniform?: 'none' | 'smartmart'
  className?: string
  label?: string
  decorative?: boolean
  framing?: 'full' | 'portrait'
}

// Derive cel-shading from the selected colors. No SVG IDs or filters, so the
// same art works in repeated thumbnails and rasterized canvas textures.
function shade(hex: string, amount: number) {
  const channels = hex.replace('#', '').match(/.{2}/g) ?? ['80', '80', '80']
  return '#' + channels.map(channel => {
    const value = parseInt(channel, 16)
    return Math.round(amount > 0 ? value + (255 - value) * amount : value * (1 + amount))
      .toString(16).padStart(2, '0')
  }).join('')
}

function BackHair({ style, color }: { style: AvatarConfig['hairStyle']; color: string }) {
  const dark = shade(color, -.27)
  return <g fill={color} stroke={dark} strokeWidth="3" strokeLinejoin="round">
    {style === 'bob' && <path d="M58 80 Q48 123 53 169 Q71 181 92 168 L153 168 Q174 181 190 165 Q192 111 180 78Z" />}
    {style === 'waves' && <path d="M61 70 Q36 110 51 143 Q35 166 52 193 Q70 205 88 187 L152 187 Q178 206 194 187 Q207 169 189 143 Q204 101 175 68Z" />}
    {style === 'ponytail' && <>
      <path d="M171 68 Q210 47 218 90 Q222 119 201 139 Q211 111 193 106 Q173 112 169 92Z" />
      <path d="M196 75 Q211 85 205 107" fill="none" stroke={shade(color, .17)} strokeWidth="5" strokeLinecap="round" />
      <path d="M176 76 L190 71 L194 85 L179 90Z" fill="#e7ad52" stroke="#a26c34" />
    </>}
    {style === 'bun' && <>
      <path d="M142 48 Q129 28 146 17 Q168 6 182 24 Q193 43 170 54Z" />
      <path d="M148 29 Q162 19 174 33" fill="none" stroke={shade(color, .24)} strokeWidth="5" strokeLinecap="round" />
      <path d="M140 46 Q154 38 175 48" fill="none" stroke="#e7ad52" strokeWidth="6" />
    </>}
  </g>
}

function FrontHair({ style, color }: { style: AvatarConfig['hairStyle']; color: string }) {
  const dark = shade(color, -.3)
  const highlight = shade(color, .22)
  const paths: Record<AvatarConfig['hairStyle'], string> = {
    short: 'M54 115 L49 86 L43 76 L56 65 L52 51 L76 49 L87 32 L109 40 L130 29 L142 40 Q173 34 185 63 L198 70 L188 88 L184 116 L169 97 L165 76 L144 85 L149 68 L124 83 L111 66 L91 84 L85 72 L70 89 L68 114 L59 123Z',
    side: 'M53 119 Q43 99 49 73 Q55 44 91 40 L84 30 Q111 22 138 37 Q182 34 191 75 Q198 100 184 122 L172 106 L168 83 Q151 76 139 62 Q134 89 98 98 L110 79 Q92 91 69 93 L66 115 L58 127Z',
    bob: 'M54 130 Q41 88 58 60 Q74 34 119 36 Q167 32 183 65 Q197 99 184 137 L174 140 L169 87 L148 87 L143 71 L135 89 L107 89 L101 75 L93 91 L72 89 L66 139Z',
    ponytail: 'M53 120 Q42 81 60 58 Q83 28 126 36 Q172 28 187 71 Q194 101 180 123 L170 104 L167 79 Q145 81 127 63 Q112 84 76 89 L68 116 L60 127Z',
    curly: 'M51 124 Q34 115 43 98 Q30 79 46 68 Q37 48 59 42 Q60 20 83 29 Q96 13 115 28 Q135 15 151 30 Q174 21 182 44 Q205 46 198 68 Q214 85 199 98 Q208 117 188 128 L173 114 Q167 100 177 89 Q156 91 151 73 Q136 91 119 75 Q103 92 89 76 Q81 94 66 89 Q75 109 61 126Z',
    waves: 'M51 129 Q36 91 57 59 Q75 28 120 36 Q170 28 188 69 Q202 96 186 132 L176 123 L169 90 Q147 95 127 66 Q117 83 96 88 L101 74 Q89 92 72 95 L65 131 L60 149Z',
    crop: 'M52 115 Q43 73 60 55 Q79 34 120 38 Q164 32 181 60 Q194 82 184 117 L172 100 L168 78 L147 77 L137 65 L124 78 L105 73 L88 81 L74 77 L68 104 L60 123Z',
    bun: 'M52 121 Q41 80 61 57 Q79 31 120 38 Q168 29 186 69 Q197 96 183 123 L174 111 L168 78 Q142 86 120 63 Q101 86 74 85 L66 116 L60 128Z',
  }
  return <g strokeLinecap="round" strokeLinejoin="round">
    <path d={paths[style]} fill={color} stroke={dark} strokeWidth="3" />
    {style === 'curly' ? <g fill="none" stroke={highlight} strokeWidth="5">
      <path d="M54 60 Q53 49 66 49 M78 41 Q88 32 99 40 M118 40 Q130 30 140 41 M159 48 Q172 42 177 56 M49 82 Q47 73 57 72" />
    </g> : <>
      <path d={style === 'side' ? 'M62 68 Q78 48 104 49 M123 48 Q146 46 166 60' : 'M67 62 Q82 46 106 48 M128 47 Q153 45 169 63'} fill="none" stroke={highlight} strokeWidth="6" />
      <path d={style === 'side' ? 'M62 92 Q88 90 109 72 M146 56 Q153 66 169 71' : 'M59 97 Q54 83 61 73 M179 78 Q185 93 180 107'} fill="none" stroke={dark} strokeWidth="2.5" opacity=".65" />
    </>}
  </g>
}

function Face({ expression, eyeStyle }: { expression: AvatarExpression; eyeStyle: AvatarConfig['eyeStyle'] }) {
  const calm = eyeStyle === 'calm'
  const eyeWidth = eyeStyle === 'bright' ? 12 : eyeStyle === 'soft' ? 10 : 11
  const eyeHeight = calm ? 10 : eyeStyle === 'round' ? 16 : 15
  const irisColor = eyeStyle === 'bright' ? '#955c37' : '#73614a'
  return <g strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="76" cy="138" rx="12" ry="6" fill="#e57f80" opacity=".38" />
    <ellipse cx="164" cy="138" rx="12" ry="6" fill="#e57f80" opacity=".38" />
    {[91, 149].map((x, index) => <g key={x} transform={`translate(${x} ${calm ? 119 : 116})`}>
      <ellipse rx={eyeWidth + 2} ry={eyeHeight + 2} fill="#fff9ef" />
      <ellipse rx={eyeWidth} ry={eyeHeight} fill="#332c37" />
      <ellipse cy="5" rx={eyeWidth - 2.5} ry={eyeHeight - 6} fill={irisColor} />
      <ellipse cy="-1" rx="4.5" ry={calm ? 5 : 8} fill="#292733" />
      <ellipse cx="-4" cy={calm ? -4 : -7} rx="4.1" ry="4.7" fill="#fffdf8" />
      <circle cx="4.5" cy="7" r="2" fill="#fff5d5" />
      <path d={`M${-eyeWidth - 3} -5 Q0 ${-eyeHeight - 9} ${eyeWidth + 3} -5`} fill="none" stroke="#40303a" strokeWidth="3" />
      {eyeStyle === 'soft' && <path d={index === 0 ? 'M-12 -6 L-16 -10' : 'M12 -6 L16 -10'} stroke="#40303a" strokeWidth="2.5" />}
    </g>)}
    <g fill="none" stroke="#57413b" strokeWidth="3">
      <path d={expression === 'concerned' ? 'M79 96 L99 91' : expression === 'confused' ? 'M79 95 Q90 89 100 93' : 'M80 94 Q90 90 99 94'} />
      <path d={expression === 'concerned' ? 'M141 91 L161 96' : expression === 'confused' ? 'M140 99 L161 94' : 'M141 94 Q151 90 160 94'} />
    </g>
    <path d="M117 133 Q120 135 123 133" fill="none" stroke="#bb7a64" strokeWidth="2" />
    {expression === 'happy' ? <>
      <path d="M109 144 Q120 148 131 144 Q129 157 120 157 Q111 156 109 144Z" fill="#87494f" stroke="#79424a" strokeWidth="2" />
      <path d="M115 153 Q120 149 126 153 Q121 158 115 153" fill="#f29b9d" />
    </> : expression === 'thinking' ? <path d="M117 147 Q124 145 130 148" fill="none" stroke="#925550" strokeWidth="2.5" />
      : expression === 'confused' ? <path d="M111 149 Q117 145 121 149 Q125 152 130 147" fill="none" stroke="#925550" strokeWidth="2.5" />
        : expression === 'concerned' ? <path d="M111 151 Q120 144 129 151" fill="none" stroke="#925550" strokeWidth="2.5" />
          : <path d="M112 147 Q120 151 128 147" fill="none" stroke="#925550" strokeWidth="2.5" />}
  </g>
}

function HeadAccessory({ config }: { config: AvatarConfig }) {
  if (config.accessory === 'glasses') return <g fill="none" stroke="#484253" strokeWidth="3.5">
    <rect x="72" y="101" width="37" height="32" rx="12" fill="#ffffff" fillOpacity=".08" />
    <rect x="131" y="101" width="37" height="32" rx="12" fill="#ffffff" fillOpacity=".08" />
    <path d="M109 113 Q120 108 131 113 M65 107 L73 110 M167 110 L175 107" />
    <path d="M79 110 L83 106 M139 110 L143 106" stroke="#fff9ef" strokeWidth="2.5" strokeLinecap="round" />
  </g>
  if (config.accessory === 'cap') return <g stroke={shade(config.topColor, -.4)} strokeWidth="3" strokeLinejoin="round">
    <path d="M54 72 Q60 29 115 27 Q166 21 181 70 L172 81 L65 82Z" fill={config.topColor} />
    <path d="M119 29 Q144 45 139 71" fill="none" stroke={shade(config.topColor, .26)} />
    <path d="M87 72 Q145 61 190 74 Q204 80 208 88 Q159 101 90 84Z" fill={shade(config.topColor, -.15)} />
    <path d="M89 48 L93 56 L102 57 L96 64 L97 72 L89 68 L81 72 L82 64 L76 57 L85 56Z" fill="#f6d685" stroke="none" />
  </g>
  if (config.accessory === 'headband') return <g strokeLinejoin="round">
    <path d="M56 78 Q59 37 119 39 Q172 36 186 79" fill="none" stroke="#966334" strokeWidth="9" />
    <path d="M56 77 Q62 40 119 42 Q171 39 185 79" fill="none" stroke="#f0c56b" strokeWidth="5" />
    <path d="M168 52 Q164 29 186 31 L179 53 Q195 38 203 49 L180 62Z" fill="#eab454" stroke="#966334" strokeWidth="2.5" />
  </g>
  return null
}

export function AvatarCharacter({ config, age = 'child', expression = config.expression ?? 'happy', uniform = 'none', className, label = 'Nhân vật', decorative = false, framing = 'full' }: AvatarCharacterProps) {
  const bodyScale = config.bodyType === 'slim' ? .9 : config.bodyType === 'broad' ? 1.12 : 1
  const top = uniform === 'smartmart' ? '#3d8668' : config.topColor
  const topDark = shade(top, -.3)
  const skinDark = shade(config.skinTone, -.23)
  const pantsDark = shade(config.bottomColor, -.3)
  const shoesDark = shade(config.shoeColor, -.38)
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    className={['avatar-character', className].filter(Boolean).join(' ')}
    viewBox={framing === 'portrait' ? '28 8 190 178' : `0 0 ${AVATAR_ART_SIZE.width} ${AVATAR_ART_SIZE.height}`}
    data-avatar-age={age}
    data-avatar-expression={expression}
    data-avatar-uniform={uniform}
    role={decorative ? undefined : 'img'}
    aria-hidden={decorative ? true : undefined}
    aria-label={decorative ? undefined : label}
    focusable="false"
  >
    <ellipse cx="120" cy="284" rx="62" ry="9" fill="#244b40" opacity=".13" />
    <BackHair style={config.hairStyle} color={config.hairColor} />
    <g transform={`translate(120 172) scale(${bodyScale} ${age === 'adult' ? 1.035 : 1}) translate(-120 -172)`} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
      {/* Short separated legs and rounded boots read clearly at map scale. */}
      <path d="M85 226 L88 264 Q99 270 111 263 L120 239 L129 264 Q144 270 154 261 L155 226Z" fill={config.bottomColor} stroke={pantsDark} />
      <path d="M90 238 L94 257 M147 238 L144 257" stroke={shade(config.bottomColor, .17)} strokeWidth="5" />
      <path d="M85 259 Q95 264 110 259 L112 277 Q93 285 75 279 Q69 270 85 265Z" fill={config.shoeColor} stroke={shoesDark} />
      <path d="M130 259 Q143 264 154 258 L157 266 Q171 269 165 279 Q146 285 128 277Z" fill={config.shoeColor} stroke={shoesDark} />
      <path d="M77 277 Q95 281 110 276 M130 276 Q149 281 164 277" fill="none" stroke={shoesDark} />
      <path d="M88 266 L101 266 M139 266 L151 266" stroke={shade(config.shoeColor, .58)} strokeWidth="4" />
      <path d="M78 195 Q64 204 61 220 Q58 231 65 236 Q75 243 82 231 L90 212Z" fill={config.skinTone} stroke={skinDark} />
      <path d="M162 195 Q176 204 179 220 Q182 231 175 236 Q165 243 158 231 L150 212Z" fill={config.skinTone} stroke={skinDark} />
      <path d="M65 223 L69 227 M175 223 L171 227" stroke={skinDark} strokeWidth="2" />
      <path d="M90 171 Q73 173 65 202 L84 213 L96 196 L144 196 L157 213 L176 202 Q168 173 150 171Z" fill={top} stroke={topDark} />
      <path d="M68 199 L86 208 M154 208 L173 199" stroke={shade(top, .35)} strokeWidth="5" />
      <path d="M89 173 Q120 162 151 173 L155 233 Q122 245 84 233Z" fill={top} stroke={topDark} />
      <path d="M144 186 L147 229 Q122 239 90 231 L88 237 Q122 247 156 235 L153 185Z" fill={topDark} opacity=".5" stroke="none" />
      <path d="M94 189 L92 218" stroke={shade(top, .23)} strokeWidth="4" />
      <path d="M110 159 L109 175 Q120 184 131 175 L130 159" fill={config.skinTone} stroke={skinDark} />
      {uniform === 'smartmart' ? <>
        <path d="M103 177 L100 199 M137 177 L140 199" stroke="#f2dcb0" strokeWidth="7" />
        <path d="M99 194 L141 194 L148 236 Q120 244 92 236Z" fill="#255747" stroke="#20483d" />
        <path d="M105 211 H135 V224 Q120 230 105 224Z" fill="#f5e5bb" stroke="none" />
        <path d="M113 219 L119 222 L128 215" fill="none" stroke="#477b56" strokeWidth="3" />
      </> : <>
        <path d="M107 174 L119 183 L109 194 L99 179Z M132 174 L120 183 L132 194 L141 179Z" fill="#f9edce" stroke={topDark} strokeWidth="2" />
        <path d="M120 187 L118 225" stroke={topDark} strokeWidth="2" />
        <circle cx="124" cy="202" r="2" fill="#f2d18a" stroke="none" />
        <circle cx="123" cy="215" r="2" fill="#f2d18a" stroke="none" />
        <path d="M135 199 L143 199 L143 208 L139 211 L135 208Z" fill="#f1cd7f" stroke={topDark} strokeWidth="1.5" />
        <path d="M86 231 Q120 241 155 231" fill="none" stroke={pantsDark} strokeWidth="6" />
        <rect x="115" y="232" width="13" height="8" rx="2" fill="#ecc374" stroke="#9e713d" strokeWidth="1.5" />
      </>}
      {config.accessory === 'bag' && <>
        <path d="M147 176 L86 225" stroke="#5b4438" strokeWidth="9" />
        <path d="M147 175 L85 224" stroke="#b78a54" strokeWidth="5" />
        <rect x="63" y="216" width="39" height="38" rx="9" fill="#b1814e" stroke="#6a4b36" />
        <path d="M64 222 Q82 214 101 222 L98 235 Q83 241 67 234Z" fill="#d0a16a" stroke="#6a4b36" />
        <rect x="79" y="231" width="8" height="10" rx="2" fill="#f4d17c" stroke="#9c703a" strokeWidth="1.5" />
      </>}
    </g>
    <g transform={age === 'adult' ? 'translate(120 167) scale(.96) translate(-120 -167)' : undefined}>
      <g fill={config.skinTone} stroke={skinDark} strokeWidth="2.5">
        <ellipse cx="57" cy="122" rx="12" ry="16" />
        <ellipse cx="183" cy="122" rx="12" ry="16" />
        <path d="M59 103 Q56 57 120 54 Q184 56 181 103 L181 128 Q180 153 153 165 Q121 180 88 165 Q60 153 59 128Z" />
      </g>
      <path d="M67 139 Q83 166 120 168 Q157 168 176 139 Q174 161 150 170 Q120 181 90 169 Q73 162 67 149Z" fill={skinDark} opacity=".26" />
      <path d="M53 119 Q61 115 60 130 M187 119 Q179 115 180 130" fill="none" stroke={skinDark} strokeWidth="2.5" strokeLinecap="round" />
      <Face expression={expression} eyeStyle={config.eyeStyle} />
      <FrontHair style={config.hairStyle} color={config.hairColor} />
      <HeadAccessory config={config} />
    </g>
  </svg>
}
