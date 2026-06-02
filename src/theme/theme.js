import { createTheme } from '@mui/material/styles'

// UESL brand: bold esports. Yellow accent, white, near-black. No gradients.
const BRAND_YELLOW = '#FFD60A'
const BRAND_YELLOW_DARK = '#E6B800'

// Hub identity colors (kept distinct from brand yellow)
export const HUB_COLORS = {
  gaming: '#FF4655', // red
  coding: '#22D3EE', // cyan
  design: '#F472B6', // pink
}

export function getTheme(mode) {
  const isDark = mode === 'dark'

  const bg = isDark
    ? { default: '#0B0B0F', paper: '#15151C', elevated: '#1C1C26' }
    : { default: '#F4F4F6', paper: '#FFFFFF', elevated: '#FFFFFF' }

  const text = isDark
    ? { primary: '#FFFFFF', secondary: '#8E8E9A' }
    : { primary: '#0B0B0F', secondary: '#5C5C68' }

  const border = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)'
  const hover = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'

  return createTheme({
    palette: {
      mode,
      primary: { main: BRAND_YELLOW, dark: BRAND_YELLOW_DARK, light: '#FFE34D', contrastText: '#0B0B0F' },
      secondary: { main: isDark ? '#FFFFFF' : '#0B0B0F', contrastText: isDark ? '#0B0B0F' : '#FFFFFF' },
      error: { main: '#FF4655' },
      warning: { main: '#F59E0B' },
      info: { main: '#22D3EE' },
      success: { main: '#22C55E' },
      background: bg,
      divider: border,
      text,
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      h1: { fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, letterSpacing: '-0.01em' },
      h2: { fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700 },
      h3: { fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700 },
      h4: { fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.01em' },
      h5: { fontFamily: "'Chakra Petch', sans-serif", fontWeight: 600 },
      h6: { fontFamily: "'Chakra Petch', sans-serif", fontWeight: 600 },
      overline: { fontWeight: 700, letterSpacing: '0.12em' },
      button: { fontWeight: 700 },
    },
    shape: { borderRadius: 6 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: bg.default },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.03em',
            borderRadius: 4,
          },
          containedPrimary: {
            backgroundColor: BRAND_YELLOW,
            color: '#0B0B0F',
            '&:hover': { backgroundColor: '#FFE34D' },
          },
          outlinedPrimary: {
            borderColor: BRAND_YELLOW,
            color: isDark ? BRAND_YELLOW : BRAND_YELLOW_DARK,
            borderWidth: 1.5,
            '&:hover': { borderColor: '#FFE34D', backgroundColor: 'rgba(255,214,10,0.08)' },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: bg.paper,
            border: `1px solid ${border}`,
            borderRadius: 8,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 4 },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { backgroundColor: bg.paper, borderRight: `1px solid ${border}` },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(11,11,15,0.85)' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${border}`,
            boxShadow: 'none',
            color: text.primary,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: border },
              '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)' },
              '&.Mui-focused fieldset': { borderColor: BRAND_YELLOW },
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            margin: '2px 8px',
            '&:hover': { backgroundColor: hover },
            '&.Mui-selected': {
              backgroundColor: 'rgba(255,214,10,0.12)',
              borderLeft: `3px solid ${BRAND_YELLOW}`,
              '&:hover': { backgroundColor: 'rgba(255,214,10,0.18)' },
            },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.03em',
            '&.Mui-selected': {
              backgroundColor: 'rgba(255,214,10,0.15)',
              color: isDark ? BRAND_YELLOW : BRAND_YELLOW_DARK,
              '&:hover': { backgroundColor: 'rgba(255,214,10,0.22)' },
            },
          },
        },
      },
    },
  })
}

export default getTheme('dark')
