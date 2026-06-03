import { useState, useEffect } from 'react'
import {
  Box, Grid, Stack, Typography, Chip, MenuItem,
  Select, FormControl, InputLabel, Divider,
} from '@mui/material'
import { SportsEsports, Code, Palette } from '@mui/icons-material'
import PostCard from '../components/shared/PostCard'
import PostEditor from '../components/shared/PostEditor'
import { LoadingState, EmptyState } from '../components/shared/States'
import { subscribePosts, togglePostLike } from '../firebase/firestore'
import { useAuth } from '../features/auth/AuthContext'

import { HUB_COLORS } from '../theme/theme'

const HUB_META = {
  gaming: {
    label: 'Gaming Hub',
    icon: <SportsEsports />,
    color: HUB_COLORS.gaming,
    description: 'Valorant, Rocket League, Minecraft & more — discuss games, find teammates, share clips.',
    subtags: ['valorant', 'rocketleague', 'minecraft', 'apex', 'fortnite', 'general'],
  },
  coding: {
    label: 'Coding Hub',
    icon: <Code />,
    color: HUB_COLORS.coding,
    description: 'Python, web dev, AI, game dev — share projects, get help, and level up your skills.',
    subtags: ['python', 'webdev', 'ai', 'gamedev', 'javascript', 'projects'],
  },
  design: {
    label: 'Design Hub',
    icon: <Palette />,
    color: HUB_COLORS.design,
    description: 'Logos, thumbnails, UI design, 3D art — showcase your work and get feedback.',
    subtags: ['figma', 'photoshop', 'logo', 'illustration', '3d', 'branding'],
  },
}

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'liked', label: 'Most Liked' },
  { value: 'discussed', label: 'Most Discussed' },
]

export default function HubPage({ hub }) {
  const meta = HUB_META[hub]
  const { currentUser } = useAuth()
  const [sort, setSort] = useState('latest')
  const [tagFilter, setTagFilter] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const unsub = subscribePosts(hub, data => { setPosts(data); setLoading(false) })
    return unsub
  }, [hub])

  function handleLike(postId) {
    if (currentUser) togglePostLike(postId, currentUser.uid).catch(e => console.error('Like failed:', e))
  }

  let displayed = tagFilter ? posts.filter(p => p.tags?.includes(tagFilter)) : posts
  if (sort === 'liked') displayed = [...displayed].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
  if (sort === 'discussed') displayed = [...displayed].sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0))

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: 'auto' }}>
      {/* Hub header */}
      <Box
        sx={{
          borderRadius: 2, p: 3, mb: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderLeft: `4px solid ${meta.color}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 52, height: 52, borderRadius: 1.5,
              bgcolor: `${meta.color}22`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: meta.color,
            }}
          >
            {meta.icon}
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700} color={meta.color}>
              {meta.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">{meta.description}</Typography>
          </Box>
        </Stack>

        {/* Subtag filter chips */}
        <Stack direction="row" flexWrap="wrap" gap={0.75} mt={2}>
          <Chip
            label="All"
            size="small"
            onClick={() => setTagFilter(null)}
            sx={{
              bgcolor: !tagFilter ? `${meta.color}22` : 'rgba(255,255,255,0.06)',
              color: !tagFilter ? meta.color : 'text.secondary',
              border: !tagFilter ? `1px solid ${meta.color}44` : '1px solid transparent',
            }}
          />
          {meta.subtags.map(t => (
            <Chip
              key={t}
              label={`#${t}`}
              size="small"
              onClick={() => setTagFilter(tagFilter === t ? null : t)}
              sx={{
                bgcolor: tagFilter === t ? `${meta.color}22` : 'rgba(255,255,255,0.06)',
                color: tagFilter === t ? meta.color : 'text.secondary',
                border: tagFilter === t ? `1px solid ${meta.color}44` : '1px solid transparent',
              }}
            />
          ))}
        </Stack>
      </Box>

      <PostEditor defaultHub={hub} />

      {/* Sort + count */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">
          {displayed.length} post{displayed.length !== 1 ? 's' : ''}
          {tagFilter ? ` tagged #${tagFilter}` : ''}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Sort by</InputLabel>
          <Select value={sort} label="Sort by" onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(o => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Posts grid */}
      {loading ? (
        <LoadingState label={`Loading ${meta.label}…`} />
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={meta.icon}
          title={tagFilter ? `No posts tagged #${tagFilter}` : 'No posts yet'}
          subtitle="Be the first to share something in this hub!"
        />
      ) : (
        <Grid container spacing={2}>
          {displayed.map(post => (
            <Grid item xs={12} sm={6} key={post.id}>
              <PostCard
                post={{ ...post, likedByMe: post.likedBy?.includes(currentUser?.uid) }}
                onLike={handleLike}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}
