import { useState, useRef } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack,
  TextField, Avatar, Box, Typography, Chip, IconButton, CircularProgress,
  InputAdornment,
} from '@mui/material'
import {
  PhotoCamera, Forum, LiveTv, YouTube, Instagram, Tag, Close,
} from '@mui/icons-material'
import { updateUserProfile, uploadAvatar } from '../../firebase/firestore'
import { useIsMobile } from '../../utils/useIsMobile'

// Social platforms (no phone-based ones). MUI lacks Discord/Twitch/X brand
// icons, so we use close-enough icons + each brand's color.
const SOCIALS = [
  { key: 'discordUrl', label: 'Discord', icon: <Forum />, color: '#5865F2', placeholder: 'discord.gg/… or username' },
  { key: 'twitchUrl', label: 'Twitch', icon: <LiveTv />, color: '#9146FF', placeholder: 'twitch.tv/you' },
  { key: 'youtubeUrl', label: 'YouTube', icon: <YouTube />, color: '#FF0000', placeholder: 'youtube.com/@you' },
  { key: 'instagramUrl', label: 'Instagram', icon: <Instagram />, color: '#E4405F', placeholder: 'instagram.com/you' },
  { key: 'xUrl', label: 'X', icon: <Tag />, color: '#1DA1F2', placeholder: 'x.com/you' },
]

export default function EditProfileDialog({ open, onClose, profile, onSaved }) {
  const isMobile = useIsMobile()
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    displayName: profile.displayName || '',
    bio: profile.bio || '',
    discordUrl: profile.discordUrl || '',
    twitchUrl: profile.twitchUrl || '',
    youtubeUrl: profile.youtubeUrl || '',
    instagramUrl: profile.instagramUrl || '',
    xUrl: profile.xUrl || '',
  })
  const [games, setGames] = useState(profile.games || [])
  const [skills, setSkills] = useState(profile.skills || [])
  const [gameInput, setGameInput] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const change = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function pickAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function addChip(value, list, setList, setInput) {
    const v = value.trim()
    if (v && !list.includes(v) && list.length < 10) setList([...list, v])
    setInput('')
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (avatarFile) await uploadAvatar(profile.uid, avatarFile)
      await updateUserProfile(profile.uid, {
        displayName: form.displayName.trim() || profile.displayName,
        bio: form.bio.trim(),
        games,
        skills,
        discordUrl: form.discordUrl.trim(),
        twitchUrl: form.twitchUrl.trim(),
        youtubeUrl: form.youtubeUrl.trim(),
        instagramUrl: form.instagramUrl.trim(),
        xUrl: form.xUrl.trim(),
      })
      onSaved?.()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile} PaperProps={{ sx: { bgcolor: 'background.paper' } }}>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} mt={0.5}>
          {/* Avatar */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ position: 'relative' }}>
              <Avatar src={avatarPreview} sx={{ width: 72, height: 72, borderRadius: 2, bgcolor: 'primary.main', color: '#0B0B0F', fontWeight: 700, fontSize: 28 }}>
                {form.displayName?.[0]}
              </Avatar>
              <IconButton
                size="small"
                onClick={() => fileRef.current?.click()}
                sx={{ position: 'absolute', bottom: -6, right: -6, bgcolor: 'primary.main', color: '#0B0B0F', '&:hover': { bgcolor: 'primary.light' } }}
              >
                <PhotoCamera fontSize="small" />
              </IconButton>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickAvatar} />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600}>Profile picture</Typography>
              <Typography variant="caption" color="text.secondary">Click the camera to upload an image.</Typography>
            </Box>
          </Stack>

          <TextField label="Display name" value={form.displayName} onChange={change('displayName')} fullWidth size="small" />
          <TextField label="Bio" value={form.bio} onChange={change('bio')} fullWidth size="small" multiline rows={2} />

          {/* Games */}
          <Box>
            <TextField
              label="Games you play (press Enter)"
              value={gameInput}
              onChange={e => setGameInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip(gameInput, games, setGames, setGameInput) } }}
              fullWidth size="small"
            />
            <Stack direction="row" flexWrap="wrap" gap={0.5} mt={1}>
              {games.map(g => <Chip key={g} label={g} size="small" onDelete={() => setGames(games.filter(x => x !== g))} />)}
            </Stack>
          </Box>

          {/* Skills */}
          <Box>
            <TextField
              label="Skills (press Enter)"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip(skillInput, skills, setSkills, setSkillInput) } }}
              fullWidth size="small"
            />
            <Stack direction="row" flexWrap="wrap" gap={0.5} mt={1}>
              {skills.map(s => <Chip key={s} label={s} size="small" onDelete={() => setSkills(skills.filter(x => x !== s))} />)}
            </Stack>
          </Box>

          {/* Socials */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>Social links</Typography>
            <Stack spacing={1.5}>
              {SOCIALS.map(s => (
                <TextField
                  key={s.key}
                  label={s.label}
                  value={form[s.key]}
                  onChange={change(s.key)}
                  placeholder={s.placeholder}
                  fullWidth size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start"><Box sx={{ color: s.color, display: 'flex' }}>{s.icon}</Box></InputAdornment> }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} startIcon={<Close />}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving && <CircularProgress size={16} />}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export { SOCIALS }
