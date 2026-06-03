import { useMediaQuery, useTheme } from '@mui/material'

// True on phone-sized screens (below the 'sm' breakpoint, ~600px).
export function useIsMobile() {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.down('sm'))
}
