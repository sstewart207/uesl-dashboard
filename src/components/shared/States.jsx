import { Box, Typography, CircularProgress } from '@mui/material'

export function LoadingState({ label = 'Loading…' }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Box>
  )
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      {icon && (
        <Box sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4, mb: 1, '& svg': { fontSize: 48 } }}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" color="text.secondary" gutterBottom>{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>{subtitle}</Typography>}
    </Box>
  )
}
