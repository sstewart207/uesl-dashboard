import { Box } from '@mui/material'

// Does an @token match a member? (by first name or full name w/o spaces)
function matches(member, token) {
  const name = (member.displayName || '').toLowerCase()
  const full = name.replace(/\s+/g, '')
  const first = name.split(' ')[0]
  return full === token || first === token
}

// Find the members mentioned in a piece of text (for notifications).
export function findMentions(text, members) {
  if (!text) return []
  const tokens = (text.match(/@(\w+)/g) || []).map(t => t.slice(1).toLowerCase())
  if (!tokens.length) return []
  return members.filter(m => tokens.some(t => matches(m, t)))
}

// Render text with @mentions turned into clickable, highlighted links.
// onProfile(uid) is called when a mention is clicked.
export function renderWithMentions(text, members, onProfile) {
  if (!text) return text
  // split keeps the @tokens as their own array entries
  return text.split(/(@\w+)/g).map((part, i) => {
    if (part.startsWith('@')) {
      const token = part.slice(1).toLowerCase()
      const m = members.find(mm => matches(mm, token))
      if (m) {
        return (
          <Box
            component="span"
            key={i}
            onClick={e => { e.stopPropagation(); onProfile(m.uid) }}
            sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            {part}
          </Box>
        )
      }
    }
    return part
  })
}
