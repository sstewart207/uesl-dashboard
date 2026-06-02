import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Stack, Typography, Card, CardContent, Button,
} from '@mui/material'
import { ThumbUp, ChatBubble, Campaign, EmojiEvents, CalendarMonth, DoneAll, NotificationsNone, AlternateEmail } from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'
import { LoadingState, EmptyState } from '../components/shared/States'
import { subscribeNotifications, markNotificationRead, markAllNotificationsRead } from '../firebase/firestore'
import { useAuth } from '../features/auth/AuthContext'

const ICON_MAP = {
  like: { icon: <ThumbUp sx={{ fontSize: 16 }} />, color: '#7C3AED', bg: 'rgba(124,58,237,0.2)' },
  comment: { icon: <ChatBubble sx={{ fontSize: 16 }} />, color: '#3B82F6', bg: 'rgba(59,130,246,0.2)' },
  bulletin: { icon: <Campaign sx={{ fontSize: 16 }} />, color: '#10B981', bg: 'rgba(16,185,129,0.2)' },
  tournament: { icon: <EmojiEvents sx={{ fontSize: 16 }} />, color: '#F59E0B', bg: 'rgba(245,158,11,0.2)' },
  event: { icon: <CalendarMonth sx={{ fontSize: 16 }} />, color: '#EC4899', bg: 'rgba(236,72,153,0.2)' },
  mention: { icon: <AlternateEmail sx={{ fontSize: 16 }} />, color: '#22D3EE', bg: 'rgba(34,211,238,0.2)' },
}

export default function Notifications() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return
    const unsub = subscribeNotifications(currentUser.uid, data => { setNotifs(data); setLoading(false) })
    return unsub
  }, [currentUser])

  const unreadCount = notifs.filter(n => !n.read).length

  function markAllRead() {
    markAllNotificationsRead(currentUser.uid, notifs.filter(n => !n.read).map(n => n.id))
  }

  function handleClick(n) {
    if (!n.read) markNotificationRead(currentUser.uid, n.id)
    if (n.postId) navigate(`/post/${n.postId}`)
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 680, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Notifications</Typography>
          {unreadCount > 0 && (
            <Typography variant="body2" color="text.secondary">{unreadCount} unread</Typography>
          )}
        </Box>
        {unreadCount > 0 && (
          <Button size="small" startIcon={<DoneAll />} onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </Stack>

      {loading ? (
        <LoadingState label="Loading notifications…" />
      ) : notifs.length === 0 ? (
        <EmptyState
          icon={<NotificationsNone />}
          title="You're all caught up"
          subtitle="Likes, comments, and announcements will show up here."
        />
      ) : (
        <Stack spacing={1.5}>
          {notifs.map(n => {
            const meta = ICON_MAP[n.type] || ICON_MAP.like
            const ts = n.createdAt?.toDate?.() || new Date()
            return (
              <Card
                key={n.id}
                onClick={() => handleClick(n)}
                sx={{
                  cursor: 'pointer',
                  border: n.read ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(124,58,237,0.35)',
                  background: n.read ? undefined : 'rgba(124,58,237,0.06)',
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: 'rgba(124,58,237,0.4)' },
                }}
              >
                <CardContent sx={{ py: '12px !important' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        bgcolor: meta.bg, color: meta.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {meta.icon}
                    </Box>
                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2">
                        <strong>{n.fromName}</strong> {n.text}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(ts, { addSuffix: true })}
                      </Typography>
                    </Box>
                    {!n.read && (
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}
