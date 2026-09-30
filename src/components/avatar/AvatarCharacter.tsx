import type {
  AvatarAge,
  AvatarConfig,
  AvatarExpression,
} from '../../avatar/avatarCatalog'

export interface AvatarCharacterProps {
  config: AvatarConfig
  age?: AvatarAge
  expression?: AvatarExpression
  uniform?: 'none' | 'smartmart'
  className?: string
  label?: string
  decorative?: boolean
}

function Hair({
  style,
  color,
}: {
  style: AvatarConfig['hairStyle']
  color: string
}) {
  if (style === 'short') {
    return <path d="M70 76 Q69 39 94 30 Q122 18 148 39 Q154 49 149 75 Q130 54 108 56 Q88 56 70 76Z" fill={color} />
  }
  if (style === 'side') {
    return <path d="M70 77 Q68 43 94 29 Q126 17 149 43 Q154 55 148 76 Q134 55 113 54 Q94 53 70 77Z M101 31 Q109 48 144 49 Q128 27 101 31Z" fill={color} />
  }
  if (style === 'bob') {
    return <path d="M67 108 Q62 44 94 27 Q127 17 151 43 Q160 68 153 118 L140 120 Q145 89 140 69 Q128 53 110 53 Q90 54 79 70 Q74 91 80 119 L67 108Z" fill={color} />
  }
  if (style === 'ponytail') {
    return <g><ellipse cx="160" cy="91" rx="22" ry="34" transform="rotate(-12 160 91)" fill={color} /><path d="M70 76 Q68 42 95 28 Q128 18 150 45 Q155 57 148 75 Q132 54 111 54 Q91 54 70 76Z" fill={color} /></g>
  }
  if (style === 'curly') {
    return <g fill={color}><circle cx="76" cy="55" r="18" /><circle cx="91" cy="37" r="20" /><circle cx="112" cy="32" r="21" /><circle cx="134" cy="39" r="20" /><circle cx="149" cy="58" r="18" /><circle cx="69" cy="77" r="15" /><circle cx="151" cy="78" r="15" /></g>
  }
  if (style === 'waves') {
    return <g fill={color}><path d="M67 111 Q61 44 93 27 Q127 17 152 44 Q162 72 151 114 Q143 102 141 76 Q130 53 110 53 Q90 54 78 74 Q75 97 67 111Z" /><path d="M70 87 Q55 111 68 137 Q87 124 79 93Z" /><path d="M150 87 Q165 111 152 137 Q133 124 141 93Z" /></g>
  }
  if (style === 'crop') {
    return <path d="M73 66 Q73 41 96 31 Q123 23 146 42 L147 65 Q132 52 111 53 Q91 53 73 66Z" fill={color} />
  }
  return <g fill={color}><circle cx="137" cy="27" r="21" /><path d="M70 76 Q68 42 95 28 Q128 18 150 45 Q155 57 148 75 Q132 54 111 54 Q91 54 70 76Z" /></g>
}

function Face({
  expression,
  eyeStyle,
}: {
  expression: AvatarExpression
  eyeStyle: AvatarConfig['eyeStyle']
}) {
  const eyeRy = eyeStyle === 'calm' ? 2.2 : eyeStyle === 'soft' ? 3 : 4
  const eyeRx = eyeStyle === 'bright' ? 4.5 : 4
  const mouth =
    expression === 'happy'
      ? 'M99 103 Q110 114 121 103'
      : expression === 'concerned'
        ? 'M101 110 Q110 100 119 110'
        : expression === 'confused'
          ? 'M101 106 Q110 111 120 104'
          : 'M102 106 Q110 109 118 106'

  return (
    <g>
      <ellipse cx="94" cy="82" rx={eyeRx} ry={eyeRy} fill="#293b39" />
      <ellipse cx="126" cy="82" rx={eyeRx} ry={eyeRy} fill="#293b39" />
      <path d={expression === 'concerned' ? 'M87 70 Q94 75 101 70' : 'M87 72 Q94 68 101 72'} stroke="#4a3a34" strokeWidth="2.7" strokeLinecap="round" fill="none" />
      <path d={expression === 'concerned' ? 'M119 70 Q126 75 133 70' : 'M119 72 Q126 68 133 72'} stroke="#4a3a34" strokeWidth="2.7" strokeLinecap="round" fill="none" />
      <path d="M110 87 Q107 94 112 97" stroke="#a56d57" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d={mouth} stroke="#9c574f" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      {expression === 'thinking' ? <circle cx="141" cy="101" r="3" fill="#d69580" opacity=".6" /> : null}
    </g>
  )
}

function Accessory({ config }: { config: AvatarConfig }) {
  if (config.accessory === 'glasses') {
    return <g fill="none" stroke="#415158" strokeWidth="3"><rect x="79" y="74" width="27" height="18" rx="7" /><rect x="114" y="74" width="27" height="18" rx="7" /><path d="M106 82 H114" /></g>
  }
  if (config.accessory === 'cap') {
    return <g fill={config.topColor}><path d="M73 46 Q110 19 148 46 L144 59 H77Z" /><path d="M112 55 Q153 52 168 64 Q144 69 111 64Z" /></g>
  }
  if (config.accessory === 'headband') {
    return <path d="M75 55 Q110 34 146 55" stroke="#e5b94d" strokeWidth="6" strokeLinecap="round" fill="none" />
  }
  if (config.accessory === 'bag') {
    return <g><path d="M129 151 L76 240" stroke="#76553d" strokeWidth="7" strokeLinecap="round" /><rect x="55" y="226" width="42" height="48" rx="10" fill="#9a714c" /><rect x="62" y="233" width="28" height="8" rx="4" fill="#c69d6a" /></g>
  }
  return null
}

export function AvatarCharacter({
  config,
  age = 'child',
  expression = 'happy',
  uniform = 'none',
  className,
  label = 'Nhân vật',
  decorative = false,
}: AvatarCharacterProps) {
  const bodyScaleX =
    config.bodyType === 'slim' ? 0.9 : config.bodyType === 'broad' ? 1.12 : 1
  const ageScaleY = age === 'adult' ? 1.04 : 1
  const bodyTransform =
    'translate(110 0) scale(' + bodyScaleX + ' ' + ageScaleY + ') translate(-110 0)'
  const shirtColor = uniform === 'smartmart' ? '#2f7d61' : config.topColor

  return (
    <svg
      className={className}
      viewBox="0 0 220 380"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
      focusable="false"
    >
      <ellipse cx="110" cy="369" rx="56" ry="8" fill="#244b4020" />

      {['bob', 'ponytail', 'waves'].includes(config.hairStyle) ? (
        <Hair style={config.hairStyle} color={config.hairColor} />
      ) : null}

      <g transform={bodyTransform}>
        <rect x="98" y="116" width="24" height="31" rx="9" fill={config.skinTone} />

        <line x1="91" y1="231" x2="88" y2="300" stroke={config.bottomColor} strokeWidth="26" strokeLinecap="round" />
        <line x1="88" y1="300" x2="86" y2="355" stroke={config.bottomColor} strokeWidth="22" strokeLinecap="round" />
        <circle cx="88" cy="300" r="9" fill={config.bottomColor} />
        <line x1="129" y1="231" x2="132" y2="300" stroke={config.bottomColor} strokeWidth="26" strokeLinecap="round" />
        <line x1="132" y1="300" x2="134" y2="355" stroke={config.bottomColor} strokeWidth="22" strokeLinecap="round" />
        <circle cx="132" cy="300" r="9" fill={config.bottomColor} />
        <path d="M70 354 Q84 346 101 353 L107 368 H67 Q60 364 70 354Z" fill={config.shoeColor} />
        <path d="M119 353 Q135 346 150 354 L156 368 H116 Q110 364 119 353Z" fill={config.shoeColor} />

        <line x1="77" y1="155" x2="58" y2="208" stroke={shirtColor} strokeWidth="20" strokeLinecap="round" />
        <circle cx="58" cy="208" r="9" fill={config.skinTone} />
        <line x1="58" y1="208" x2="68" y2="260" stroke={config.skinTone} strokeWidth="14" strokeLinecap="round" />
        <circle cx="68" cy="264" r="9" fill={config.skinTone} />
        <line x1="143" y1="155" x2="162" y2="208" stroke={shirtColor} strokeWidth="20" strokeLinecap="round" />
        <circle cx="162" cy="208" r="9" fill={config.skinTone} />
        <line x1="162" y1="208" x2="152" y2="260" stroke={config.skinTone} strokeWidth="14" strokeLinecap="round" />
        <circle cx="152" cy="264" r="9" fill={config.skinTone} />

        <path d="M74 151 Q77 137 94 134 Q110 146 126 134 Q143 137 146 151 L141 236 Q110 247 79 236Z" fill={shirtColor} />
        <path d="M90 136 Q110 154 130 136" stroke="#ffffffaa" strokeWidth="4" fill="none" strokeLinecap="round" />

        {uniform === 'smartmart' ? (
          <g>
            <path d="M84 170 H136 L141 234 H79Z" fill="#205e48" />
            <rect x="89" y="188" width="42" height="27" rx="7" fill="#f6edd3" />
            <path d="M98 201 H122" stroke="#d6a43d" strokeWidth="3" strokeLinecap="round" />
          </g>
        ) : null}
      </g>

      <circle cx="72" cy="86" r="9" fill={config.skinTone} />
      <circle cx="148" cy="86" r="9" fill={config.skinTone} />
      <ellipse cx="110" cy="80" rx={age === 'child' ? 39 : 37} ry={age === 'child' ? 45 : 43} fill={config.skinTone} />

      {!['bob', 'ponytail', 'waves'].includes(config.hairStyle) ? (
        <Hair style={config.hairStyle} color={config.hairColor} />
      ) : null}

      <Face expression={expression} eyeStyle={config.eyeStyle} />
      <Accessory config={config} />
    </svg>
  )
}
