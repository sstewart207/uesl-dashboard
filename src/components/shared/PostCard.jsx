import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card, CardContent, CardActions, Box, Avatar, Typography,
  Chip, IconButton, Stack, Divider, Tooltip,
} from '@mui/material'
import {
  ThumbUp, ThumbUpOutlined, ChatBubbleOutline,
  SportsEsports, Code, Palette, PushPin, DeleteOutline,
} from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'
import { HUB_COLORS } from '../../theme/theme'
import { cleanHtml } from '../../utils/sanitize'
import { parseVideoUrl } from '../../utils/video'

const HUB_META = {
  gaming: { label: 'Gaming', color: HUB_COLORS.gaming, icon: <SportsEsports fontSize="inherit" /> },
  coding: { label: 'Coding', color: HUB_COLORS.coding, icon: <Code fontSize="inherit" /> },
  design: { label: 'Design', color: HUB_COLORS.design, icon: <Palette fontSize="inherit" /> },
}

export default function PostCard({ post, onLike, onDelete, compact = false }) {
  const navigate = useNavigate()
  const hub = HUB_META[post.hub] || HUB_META.gaming
  const [liked, setLiked] = useState(post.likedByMe || false)

  function handleLike(e) {
    e.stopPropagation()
    setLiked(l => !l)
    onLike?.(post.id, !liked)
  }

  const ts = post.createdAt?.toDate?.() || new Date(post.createdAt || Date.now())

  return (
    <Card
      onClick={() => navigate(`/post/${post.id}`)}
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              src={post.authorAvatar}
              onClick={e => { e.stopPropagation(); navigate(`/profile/${post.authorUid}`) }}
              sx={{ width: 38, height: 38, bgcolor: 'primary.main', color: '#0B0B0F', fontWeight: 700, cursor: 'pointer', fontSize: 15, borderRadius: 1.5 }}
            >
              {post.authorName?.[0]}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                onClick={e => { e.stopPropagation(); navigate(`/profile/${post.authorUid}`) }}
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.light' } }}
              >
                {post.authorName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(ts, { addSuffix: true })}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {post.isPinned && (
              <Tooltip title="Pinned">
                <PushPin sx={{ fontSize: 14, color: 'warning.main', transform: 'rotate(45deg)' }} />
              </Tooltip>
            )}
            <Chip
              icon={hub.icon}
              label={hub.label}
              size="small"
              sx={{
                fontSize: 11, height: 22,
                bgcolor: `${hub.color}22`,
                color: hub.color,
                border: `1px solid ${hub.color}44`,
                '& .MuiChip-icon': { color: hub.color, fontSize: 12 },
              }}
            />
          </Stack>
        </Stack>

        {/* Title */}
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {post.title}
        </Typography>

        {/* Body preview */}
        {!compact && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1.5,
              '& *': { margin: 0 },
            }}
            dangerouslySetInnerHTML={{ __html: cleanHtml(post.body) }}
          />
        )}

        {/* Video thumbnail */}
        {post.videoUrl && (() => {
          const v = parseVideoUrl(post.videoUrl)
          if (!v) return null
          return (
            <Box
              mt={1}
              sx={{
                position: 'relative', borderRadius: 1.5, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {v.thumbnailUrl ? (
                <Box component="img" src={v.thumbnailUrl} alt="Video preview"
                  sx={{ width: '100%', display: 'block', maxHeight: 160, objectFit: 'cover' }} />
              ) : (
                <Box sx={{ bgcolor: 'rgba(100,65,165,0.25)', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" color="text.secondary">{v.label}</Typography>
                </Box>
              )}
              <Box sx={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.3)',
              }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography sx={{ color: '#fff', fontSize: 18, lineHeight: 1, pl: 0.5 }}>▶</Typography>
                </Box>
              </Box>
            </Box>
          )
        })()}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={0.5} mt={1}>
            {post.tags.map(tag => (
              <Chip
                key={tag}
                label={`#${tag}`}
                size="small"
                onClick={e => e.stopPropagation()}
                sx={{ fontSize: 11, height: 20, bgcolor: 'rgba(255,255,255,0.05)' }}
              />
            ))}
          </Stack>
        )}
      </CardContent>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      <CardActions sx={{ px: 2, py: 0.5 }}>
        <IconButton size="small" onClick={handleLike} sx={{ color: liked ? 'primary.light' : 'text.secondary' }}>
          {liked ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}
        </IconButton>
        <Typography variant="caption" color="text.secondary" mr={2}>
          {(post.likeCount || 0) + (liked && !post.likedByMe ? 1 : 0)}
        </Typography>

        <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`) }}>
          <ChatBubbleOutline fontSize="small" />
        </IconButton>
        <Typography variant="caption" color="text.secondary">
          {post.commentCount || 0}
        </Typography>

        {onDelete && (
          <Tooltip title="Delete post">
            <IconButton
              size="small"
              onClick={e => { e.stopPropagation(); onDelete(post.id) }}
              sx={{ ml: 'auto', color: 'text.secondary', '&:hover': { color: 'error.main' } }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  )
}
