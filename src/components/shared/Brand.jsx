import { Box, Typography, Stack } from '@mui/material'

// Angular UESL badge — a yellow clipped square with the bolt/initials.
export function BrandMark({ size = 36 }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        bgcolor: 'primary.main',
        color: '#0B0B0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Chakra Petch', sans-serif",
        fontWeight: 700,
        fontSize: size * 0.42,
        // angular clipped corner for an esports look
        clipPath: 'polygon(0 0, 100% 0, 100% 72%, 72% 100%, 0 100%)',
        letterSpacing: '-0.04em',
      }}
    >
      UE
    </Box>
  )
}

export function BrandWordmark({ size = 'md', showSub = true }) {
  const titleSize = size === 'lg' ? 'h4' : size === 'sm' ? 'subtitle1' : 'h6'
  const markSize = size === 'lg' ? 44 : size === 'sm' ? 28 : 36
  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <BrandMark size={markSize} />
      <Box>
        <Typography
          variant={titleSize}
          sx={{ lineHeight: 1, fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, letterSpacing: '0.02em' }}
        >
          UESL
        </Typography>
        {showSub && (
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.08em', fontSize: 10 }}>
            UNITED ESPORTS LEAGUE
          </Typography>
        )}
      </Box>
    </Stack>
  )
}
