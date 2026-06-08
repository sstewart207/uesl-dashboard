import { useState } from 'react'
import {
  Box, Card, CardContent, TextField, Button, Stack,
  Chip, Typography, MenuItem, Select, FormControl, InputLabel,
  CircularProgress, IconButton,
} from '@mui/material'
import { Close } from '@mui/icons-material'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { createPost } from '../../firebase/firestore'
import { useAuth } from '../../features/auth/AuthContext'
import GifPicker from './GifPicker'

const MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ],
}

export default function PostEditor({ defaultHub = 'gaming', onPosted }) {
  const { currentUser, userProfile } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [hub, setHub] = useState(defaultHub)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [gifUrl, setGifUrl] = useState('')
  const [loading, setLoading] = useState(false)

  function addTag(e) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
      if (t && !tags.includes(t) && tags.length < 6) setTags(ts => [...ts, t])
      setTagInput('')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    // A post needs a title plus *some* content — text body or a GIF.
    const hasBody = body && body !== '<p><br></p>' && body.trim()
    if (!title.trim() || (!hasBody && !gifUrl)) return
    setLoading(true)
    try {
      await createPost({
        authorUid: currentUser.uid,
        authorName: userProfile.displayName,
        authorAvatar: userProfile.avatarUrl || '',
        hub,
        title: title.trim(),
        body,
        gifUrl,
        tags,
      })
      setTitle('')
      setBody('')
      setTags([])
      setTagInput('')
      setGifUrl('')
      onPosted?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Create a post
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5}>
              <TextField
                label="Post title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                fullWidth
                size="small"
              />
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Hub</InputLabel>
                <Select value={hub} label="Hub" onChange={e => setHub(e.target.value)}>
                  <MenuItem value="gaming">Gaming</MenuItem>
                  <MenuItem value="coding">Coding</MenuItem>
                  <MenuItem value="design">Design</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <ReactQuill
              theme="snow"
              value={body}
              onChange={setBody}
              modules={MODULES}
              placeholder="What's on your mind?"
            />

            <Box>
              <TextField
                label="Add tags (press Enter)"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag}
                size="small"
                fullWidth
                helperText="Up to 6 tags"
              />
              <Stack direction="row" flexWrap="wrap" gap={0.5} mt={1}>
                {tags.map(t => (
                  <Chip
                    key={t}
                    label={`#${t}`}
                    size="small"
                    onDelete={() => setTags(ts => ts.filter(x => x !== t))}
                  />
                ))}
              </Stack>
            </Box>

            {gifUrl && (
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Box component="img" src={gifUrl} alt="selected gif" sx={{ maxWidth: 220, width: '100%', borderRadius: 1, display: 'block' }} />
                <IconButton size="small" onClick={() => setGifUrl('')}
                  sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' } }}>
                  <Close sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            )}

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <GifPicker onSelect={setGifUrl} />
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !title.trim()}
                startIcon={loading && <CircularProgress size={16} />}
              >
                Post
              </Button>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}
