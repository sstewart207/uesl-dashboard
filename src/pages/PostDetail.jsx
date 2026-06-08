import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, Stack, Typography, Avatar, Chip,
  Divider, IconButton, Button, TextField, CircularProgress,
} from '@mui/material'
import { ThumbUpOutlined, ThumbUp, ArrowBack, Send, DeleteOutline, Close } from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'
import { LoadingState } from '../components/shared/States'
import {
  getPost, subscribeComments, addComment, togglePostLike, createNotification,
  deletePost, deleteComment, subscribeMembers,
} from '../firebase/firestore'
import { useAuth } from '../features/auth/AuthContext'
import { HUB_COLORS } from '../theme/theme'
import { cleanHtml } from '../utils/sanitize'
import { findMentions, renderWithMentions } from '../utils/mentions'
import GifPicker from '../components/shared/GifPicker'

// Only render GIFs served from giphy.com (don't render arbitrary user URLs as <img>).
function isSafeGif(url) {
  try { return new URL(url).hostname.endsWith('giphy.com') } catch { return false }
}

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, userProfile, canApprove } = useAuth()
  // Coaches/admins (canApprove) can moderate; authors can remove their own.
  const isStaff = canApprove

  async function handleDeletePost() {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    try {
      await deletePost(id)
      navigate(-1)
    } catch (e) {
      console.error('Delete post failed:', e)
      alert('Could not delete the post. Please try again.')
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm('Delete this comment?')) return
    try {
      await deleteComment(id, commentId)
    } catch (e) {
      console.error('Delete comment failed:', e)
      alert('Could not delete the comment. Please try again.')
    }
  }
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [gifUrl, setGifUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [members, setMembers] = useState([])

  useEffect(() => {
    // `active` guards against the component unmounting (or id changing)
    // before getPost resolves — otherwise we'd subscribe to comments after
    // unmount (leak) and setState on an unmounted component.
    let active = true
    let unsubComments
    getPost(id)
      .then(p => {
        if (!active) return
        setPost(p)
        setLoading(false)
        if (p) unsubComments = subscribeComments(id, setComments)
      })
      .catch(e => { if (active) { console.error('Failed to load post:', e); setLoading(false) } })
    const unsubMembers = subscribeMembers(setMembers)
    return () => { active = false; unsubComments?.(); unsubMembers() }
  }, [id])

  if (loading) return <LoadingState label="Loading post…" />

  if (!post) {
    return (
      <Box p={4} textAlign="center">
        <Typography color="text.secondary">Post not found.</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>Go back</Button>
      </Box>
    )
  }

  const liked = post.likedBy?.includes(currentUser?.uid)
  const color = HUB_COLORS[post.hub] || '#7C3AED'

  async function handleLike() {
   try {
    await togglePostLike(id, currentUser.uid)
    const updated = await getPost(id)
    setPost(updated)
    // Notify the author (not self)
    if (!liked && post.authorUid !== currentUser.uid) {
      createNotification(post.authorUid, {
        type: 'like',
        fromUid: currentUser.uid,
        fromName: userProfile.displayName,
        text: `liked your post "${post.title}"`,
        postId: id,
      })
    }
   } catch (e) {
     console.error('Like failed:', e)
   }
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!comment.trim() && !gifUrl) return // allow text, gif, or both
    setSubmitting(true)
    try {
      await addComment(id, {
        authorUid: currentUser.uid,
        authorName: userProfile.displayName,
        authorAvatar: userProfile.avatarUrl || '',
        body: comment.trim(),
        gifUrl: gifUrl || '',
      })
      if (post.authorUid !== currentUser.uid) {
        createNotification(post.authorUid, {
          type: 'comment',
          fromUid: currentUser.uid,
          fromName: userProfile.displayName,
          text: `commented on your post "${post.title}"`,
          postId: id,
        })
      }
      // Notify anyone @mentioned (skip self + the author, who already got pinged)
      findMentions(comment, members)
        .filter(m => m.uid !== currentUser.uid && m.uid !== post.authorUid)
        .forEach(m => createNotification(m.uid, {
          type: 'mention',
          fromUid: currentUser.uid,
          fromName: userProfile.displayName,
          text: `mentioned you in a comment on "${post.title}"`,
          postId: id,
        }))
      setComment('')
      setGifUrl('')
    } catch (e) {
      console.error('Comment failed:', e)
      alert('Could not post your comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const ts = post.createdAt?.toDate?.() || new Date(post.createdAt || Date.now())

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 760, mx: 'auto' }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>

      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
            <Avatar
              src={post.authorAvatar}
              sx={{ width: 44, height: 44, bgcolor: 'primary.main', color: '#0B0B0F', fontWeight: 700, borderRadius: 1.5, cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${post.authorUid}`)}
            >
              {post.authorName?.[0]}
            </Avatar>
            <Box flex={1}>
              <Typography fontWeight={600}>{post.authorName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(ts, { addSuffix: true })}
              </Typography>
            </Box>
            <Chip
              label={post.hub}
              size="small"
              sx={{ bgcolor: `${color}22`, color, border: `1px solid ${color}44`, fontSize: 12 }}
            />
            {(isStaff || post.authorUid === currentUser?.uid) && (
              <IconButton size="small" onClick={handleDeletePost} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                <DeleteOutline fontSize="small" />
              </IconButton>
            )}
          </Stack>

          <Typography variant="h5" fontWeight={700} gutterBottom>{post.title}</Typography>

          <Box
            sx={{ mb: 2, '& p': { mb: 1 }, '& code': { bgcolor: 'rgba(255,255,255,0.08)', px: 0.5, borderRadius: 0.5 }, '& img': { maxWidth: '100%', borderRadius: 1 } }}
            dangerouslySetInnerHTML={{ __html: cleanHtml(post.body) }}
          />

          {post.gifUrl && isSafeGif(post.gifUrl) && (
            <Box component="img" src={post.gifUrl} alt="gif" loading="lazy"
              sx={{ mb: 2, maxWidth: 360, width: '100%', borderRadius: 1, display: 'block' }} />
          )}

          {post.tags?.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={0.5} mb={2}>
              {post.tags.map(t => (
                <Chip key={t} label={`#${t}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', fontSize: 11 }} />
              ))}
            </Stack>
          )}

          <Divider sx={{ mb: 1.5 }} />

          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton size="small" onClick={handleLike} sx={{ color: liked ? 'primary.light' : 'text.secondary' }}>
              {liked ? <ThumbUp /> : <ThumbUpOutlined />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {post.likeCount || 0} likes
            </Typography>
            <Typography variant="body2" color="text.secondary" ml={1}>
              {comments.length} comments
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Box mt={3}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>Comments</Typography>
        <Stack spacing={2} mb={3}>
          {comments.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
              No comments yet. Start the conversation!
            </Typography>
          )}
          {comments.map(c => {
            const cts = c.createdAt?.toDate?.() || new Date()
            return (
              <Card key={c.id} variant="outlined" sx={{ background: 'rgba(255,255,255,0.02)' }}>
                <CardContent sx={{ py: '10px !important' }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar src={c.authorAvatar} sx={{ width: 32, height: 32, bgcolor: 'rgba(128,128,140,0.25)', color: 'text.primary', fontWeight: 600, fontSize: 13 }}>
                      {c.authorName?.[0]}
                    </Avatar>
                    <Box flex={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" fontSize={13}>{c.authorName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(cts, { addSuffix: true })}
                        </Typography>
                      </Stack>
                      {c.body && (
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          {renderWithMentions(c.body, members, uid => navigate(`/profile/${uid}`))}
                        </Typography>
                      )}
                      {c.gifUrl && isSafeGif(c.gifUrl) && (
                        <Box component="img" src={c.gifUrl} alt="gif" loading="lazy"
                          sx={{ mt: 1, maxWidth: 220, width: '100%', borderRadius: 1, display: 'block' }} />
                      )}
                    </Box>
                    {(isStaff || c.authorUid === currentUser?.uid) && (
                      <IconButton size="small" onClick={() => handleDeleteComment(c.id)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                        <DeleteOutline sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )
          })}
        </Stack>

        <Box component="form" onSubmit={handleComment}>
          {gifUrl && (
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 1, ml: 6 }}>
              <Box component="img" src={gifUrl} alt="selected gif" sx={{ maxWidth: 160, borderRadius: 1, display: 'block' }} />
              <IconButton size="small" onClick={() => setGifUrl('')}
                sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' } }}>
                <Close sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          )}
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Avatar src={userProfile?.avatarUrl} sx={{ width: 36, height: 36, bgcolor: 'primary.main', color: '#0B0B0F', fontWeight: 700, borderRadius: 1.5, flexShrink: 0, fontSize: 15 }}>
              {userProfile?.displayName?.[0]}
            </Avatar>
            <TextField
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write a comment… (@name to mention, GIF button for GIFs)"
              fullWidth size="small" multiline maxRows={4}
            />
            <GifPicker onSelect={setGifUrl} />
            <IconButton type="submit" disabled={submitting || (!comment.trim() && !gifUrl)} color="primary">
              {submitting ? <CircularProgress size={20} /> : <Send />}
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
