import { useState } from 'react'
import {
  Box, Card, CardContent, TextField, Button, Stack,
  Chip, Typography, MenuItem, Select, FormControl, InputLabel,
  CircularProgress,
} from '@mui/material'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { createPost } from '../../firebase/firestore'
import { useAuth } from '../../features/auth/AuthContext'

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
    if (!title.trim() || body === '<p><br></p>' || !body.trim()) return
    setLoading(true)
    try {
      await createPost({
        authorUid: currentUser.uid,
        authorName: userProfile.displayName,
        authorAvatar: userProfile.avatarUrl || '',
        hub,
        title: title.trim(),
        body,
        tags,
      })
      setTitle('')
      setBody('')
      setTags([])
      setTagInput('')
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

            <Box display="flex" justifyContent="flex-end">
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
