import DOMPurify from 'dompurify'

// Strip dangerous HTML (scripts, event handlers, etc.) from user-generated
// rich text before we render it with dangerouslySetInnerHTML. Keeps safe
// formatting (bold, lists, links, images, code) — blocks XSS.
export function cleanHtml(dirty) {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, {
    ADD_ATTR: ['target', 'rel'], // allow links to open safely
  })
}
