import { useState, useEffect } from 'react'
import {
  Box, Stack, Typography, Card, CardContent, Button, Chip,
  Avatar, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress,
} from '@mui/material'
import { Campaign, Add, PushPin, AttachFile } from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { LoadingState, EmptyState } from '../components/shared/States'
import { subscribeBulletins, createBulletin } from '../firebase/firestore'
import { useAuth } from '../features/auth/AuthContext'

function BulletinCard({ bulletin }) {
  const [expanded, setExpanded] = useState(false)
  const ts = bulletin.createdAt?.toDate?.() || new Date(bulletin.createdAt || Date.now())
  return (
    <Card
      sx={{
        border: bulletin.isPinned ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {bulletin.isPinned && (
        <Box
          sx={{
            position: 'absolute', top: -10, left: 16,
            bgcolor: 'warning.main', borderRadius: 1, px: 1, py: 0.25,
            display: 'flex', alignItems: 'center', gap: 0.5,
          }}
        >
          <PushPin sx={{ fontSize: 12, color: '#000' }} />
          <Typography variant="caption" sx={{ color: '#000', fontWeight: 700, fontSize: 10 }}>PINNED</Typography>
        </Box>
      )}
      <CardContent sx={{ pt: bulletin.isPinned ? 3 : 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Avatar sx={{ bgcolor: 'primary.main', color: '#0B0B0F', width: 40, height: 40, borderRadius: 1.5, flexShrink: 0 }}>
            <Campaign fontSize="small" />
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>{bulletin.title}</Typography>
                <Stack direction="row" spacing={1} alignItems="center" mt={0.25}>
                  <Chip label="Coach" size="small" sx={{ height: 18, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', bgcolor: 'rgba(255,214,10,0.15)', color: 'primary.main' }} />
                  <Typography variant="caption" color="text.secondary">{bulletin.createdBy}</Typography>
                  <Typography variant="caption" color="text.secondary">·</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(ts, { addSuffix: true })}
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            <Box
              sx={{
                mt: 1.5,
                maxHeight: expanded ? 'none' : '80px',
                overflow: 'hidden',
                position: 'relative',
                '&::after': !expanded ? {
                  content: '""',
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 32,
                  background: theme => `linear-gradient(transparent, ${theme.palette.background.paper})`,
                } : {},
              }}
              dangerouslySetInnerHTML={{ __html: bulletin.body }}
            />
            <Button size="small" sx={{ mt: 0.5, fontSize: 12 }} onClick={() => setExpanded(e => !e)}>
              {expanded ? 'Show less' : 'Read more'}
            </Button>

            {bulletin.attachments?.length > 0 && (
              <Stack direction="row" flexWrap="wrap" gap={0.5} mt={1}>
                {bulletin.attachments.map(f => (
                  <Chip key={f} icon={<AttachFile fontSize="inherit" />} label={f} size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.06)', fontSize: 11, cursor: 'pointer' }} />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

function AddBulletinDialog({ open, onClose, onAdd }) {
  const { userProfile } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pinned, setPinned] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await onAdd({ title, body, isPinned: pinned, createdBy: userProfile?.displayName, createdByUid: userProfile?.uid, attachments: [] })
      setTitle('')
      setBody('')
      setPinned(false)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper' } }}>
      <DialogTitle>Post Bulletin</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} required fullWidth />
            <ReactQuill theme="snow" value={body} onChange={setBody} placeholder="Write your announcement…" style={{ minHeight: 160 }} />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip
                icon={<PushPin fontSize="small" />}
                label="Pin this bulletin"
                onClick={() => setPinned(p => !p)}
                variant={pinned ? 'filled' : 'outlined'}
                color={pinned ? 'warning' : 'default'}
                sx={{ cursor: 'pointer' }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading || !title.trim()}>
            {loading ? <CircularProgress size={18} /> : 'Post Bulletin'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default function Bulletins() {
  const { userProfile } = useAuth()
  const [bulletins, setBulletins] = useState([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const isCoach = userProfile?.role === 'coach' || userProfile?.role === 'admin'

  useEffect(() => {
    const unsub = subscribeBulletins(data => { setBulletins(data); setLoading(false) })
    return unsub
  }, [])

  const sorted = [...bulletins].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return 0
  })

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 780, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Campaign sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h4" fontWeight={700}>Bulletin Board</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Important announcements from coaching staff
          </Typography>
        </Box>
        {isCoach && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)}>
            Post Bulletin
          </Button>
        )}
      </Stack>

      {loading ? (
        <LoadingState label="Loading bulletins…" />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<Campaign />}
          title="No bulletins yet"
          subtitle={isCoach ? 'Post the first announcement for the club.' : 'Check back for announcements from coaches.'}
        />
      ) : (
        <Stack spacing={3}>
          {sorted.map(b => <BulletinCard key={b.id} bulletin={b} />)}
        </Stack>
      )}

      <AddBulletinDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={createBulletin}
      />
    </Box>
  )
}
