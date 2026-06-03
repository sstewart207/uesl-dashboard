import { Box } from '@mui/material'

// Match @name only when it starts the string or follows a non-word char.
// This stops emails (a@b.com) from being read as a mention, and allows
// hyphens in names (@jean-luc).
const MENTION_RE = /(^|[^\w])@([\w-]+)/g

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
  const tokens = Array.from(text.matchAll(MENTION_RE), m => m[2].toLowerCase())
  if (!tokens.length) return []
  return members.filter(m => tokens.some(t => matches(m, t)))
}

// Render text with @mentions turned into clickable, keyboard-accessible links.
// onProfile(uid) is called when a mention is activated.
export function renderWithMentions(text, members, onProfile) {
  if (!text) return text
  const out = []
  let last = 0
  let key = 0
  let m
  MENTION_RE.lastIndex = 0
  while ((m = MENTION_RE.exec(text)) !== null) {
    const [matchStr, prefix, token] = m
    // text before the @ (plus the prefix char that isn't part of the mention)
    out.push(text.slice(last, m.index) + prefix)
    const member = members.find(mm => matches(mm, token.toLowerCase()))
    if (member) {
      out.push(
        <Box
          component="span"
          key={key++}
          role="link"
          tabIndex={0}
          onClick={e => { e.stopPropagation(); onProfile(member.uid) }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onProfile(member.uid) }
          }}
          sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          @{token}
        </Box>
      )
    } else {
      out.push('@' + token)
    }
    last = m.index + matchStr.length
  }
  out.push(text.slice(last))
  return out
}
