import { useState, useRef } from 'react'
import {
  Box, Card, CardContent, TextField, Button, Stack,
  Chip, Typography, MenuItem, Select, FormControl, InputLabel,
  CircularProgress,
} from '@mui/material'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { createPost } from '../../firebase/firestore'
import { useAuth } from '../../features/auth/AuthContext'
import GifPicker from './GifPicker'
import { parseVideoUrl, extractVideoUrl } from '../../utils/video'

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
  const [videoParsed, setVideoParsed] = useState(null)
  const [detectedVideoUrl, setDetectedVideoUrl] = useState('')
  const quillRef = useRef(null)

  // Drop the chosen GIF straight into the body at the cursor (like Facebook),
  // so it lives inside the post text instead of as a separate attachment.
  function insertGif(url) {
    const editor = quillRef.current?.getEditor()
    if (!editor) return
    const range = editor.getSelection(true)
    const index = range ? range.index : editor.getLength()
    editor.insertEmbed(index, 'image', url, 'user')
    editor.setSelection(index + 1, 0)
  }

  function scanForVideo(text) {
    const found = extractVideoUrl(text)
    if (found) {
      const parsed = parseVideoUrl(found)
      if (parsed) { setDetectedVideoUrl(found); setVideoParsed(parsed); return }
    }
    setDetectedVideoUrl('')
    setVideoParsed(null)
  }

  function handleTitleChange(e) {
    setTitle(e.target.value)
    scanForVideo(e.target.value)
  }

  function handleBodyChange(val) {
    setBody(val)
    if (!detectedVideoUrl) scanForVideo(val.replace(/<[^>]+>/g, ' '))
  }

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
    // A post needs a title plus some content (text or an embedded GIF/image).
    const hasBody = body && body !== '<p><br></p>' && body.trim()
    if (!title.trim() || !hasBody) return
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
        ...(videoParsed ? { videoUrl: detectedVideoUrl } : {}),
      })
      setTitle('')
      setBody('')
      setTags([])
      setTagInput('')
      setDetectedVideoUrl('')
      setVideoParsed(null)
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
                onChange={handleTitleChange}
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

            {/* Body editor — the GIF button sits in the toolbar strip and
                inserts the GIF inline into the body, so it appears in-field. */}
            <Box sx={{ position: 'relative' }}>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={body}
                onChange={handleBodyChange}
                modules={MODULES}
                placeholder="What's on your mind?"
              />
              <Box sx={{ position: 'absolute', top: 4, right: 6, zIndex: 1 }}>
                <GifPicker onSelect={insertGif} />
              </Box>
            </Box>

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

            {videoParsed && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip
                  label={`▶ ${videoParsed.label} detected`}
                  size="small"
                  onDelete={() => { setDetectedVideoUrl(''); setVideoParsed(null) }}
                  sx={{ bgcolor: 'rgba(34,197,94,0.15)', color: '#22C55E', borderColor: 'rgba(34,197,94,0.3)', border: '1px solid' }}
                />
              </Stack>
            )}

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
