import { useState, useEffect } from 'react'
import {
  IconButton, Popover, Box, TextField, CircularProgress, Typography, Tooltip,
} from '@mui/material'
import { GifBox } from '@mui/icons-material'

const KEY = import.meta.env.VITE_GIPHY_API_KEY
const GIPHY = 'https://api.giphy.com/v1/gifs'

// A GIF search/picker button (Giphy). Calls onSelect(gifUrl) when a GIF is
// chosen. No file uploads — search + click only.
export default function GifPicker({ onSelect }) {
  const [anchor, setAnchor] = useState(null)
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const open = Boolean(anchor)

  useEffect(() => {
    if (!open || !KEY) return
    let active = true
    setLoading(true)
    const endpoint = q.trim()
      ? `${GIPHY}/search?api_key=${KEY}&q=${encodeURIComponent(q)}&limit=12&rating=pg-13`
      : `${GIPHY}/trending?api_key=${KEY}&limit=12&rating=pg-13`
    // debounce typing so we don't hammer the API
    const t = setTimeout(() => {
      fetch(endpoint)
        .then(r => r.json())
        .then(d => {
          if (!active) return
          setResults((d.data || []).map(g => ({
            id: g.id,
            preview: g.images.fixed_width_small.url,
            full: g.images.fixed_height.url,
          })))
        })
        .catch(e => console.error('Giphy request failed:', e))
        .finally(() => { if (active) setLoading(false) })
    }, 350)
    return () => { active = false; clearTimeout(t) }
  }, [q, open])

  function pick(url) {
    onSelect(url)
    setAnchor(null)
    setQ('')
  }

  return (
    <>
      <Tooltip title={KEY ? 'Add a GIF' : 'GIF picker needs a Giphy API key in .env'}>
        <span>
          <IconButton size="small" color="primary" disabled={!KEY} onClick={e => setAnchor(e.currentTarget)}>
            <GifBox />
          </IconButton>
        </span>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        PaperProps={{ sx: { bgcolor: 'background.paper' } }}
      >
        <Box sx={{ p: 1.5, width: 320 }}>
          <TextField
            size="small"
            fullWidth
            autoFocus
            placeholder="Search GIFs…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <Box sx={{ mt: 1, height: 240, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
            {loading && (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 5 }}><CircularProgress size={24} /></Box>
            )}
            {!loading && results.length === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 5 }}>
                No GIFs found
              </Typography>
            )}
            {!loading && results.map(g => (
              <Box
                key={g.id}
                component="img"
                src={g.preview}
                loading="lazy"
                onClick={() => pick(g.full)}
                sx={{ width: '100%', borderRadius: 1, cursor: 'pointer', '&:hover': { outline: '2px solid', outlineColor: 'primary.main' } }}
              />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right', opacity: 0.6 }}>
            Powered by GIPHY
          </Typography>
        </Box>
      </Popover>
    </>
  )
}
