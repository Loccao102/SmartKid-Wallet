import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { defaultStudentAvatar } from '../../avatar/avatarCatalog'
import { AvatarCharacter } from './AvatarCharacter'

describe('saved avatar appearance', () => {
  it('renders the saved expression and outfit color by default', () => {
    const markup = renderToStaticMarkup(<AvatarCharacter config={{
      ...defaultStudentAvatar, expression: 'thinking', topColor: '#a874b7',
    }} />)
    expect(markup).toContain('data-avatar-expression="thinking"')
    expect(markup).toContain('fill="#a874b7"')
  })

  it('allows a scene expression to override the saved expression', () => {
    const markup = renderToStaticMarkup(<AvatarCharacter
      config={{ ...defaultStudentAvatar, expression: 'thinking' }} expression="concerned"
    />)
    expect(markup).toContain('data-avatar-expression="concerned"')
  })
})
