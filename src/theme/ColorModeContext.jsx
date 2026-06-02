import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { getTheme } from './theme'

const ColorModeContext = createContext({ mode: 'dark', toggle: () => {} })

export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('uesl-color-mode') || 'dark')

  useEffect(() => {
    localStorage.setItem('uesl-color-mode', mode)
    document.documentElement.setAttribute('data-mode', mode)
  }, [mode])

  const value = useMemo(() => ({
    mode,
    toggle: () => setMode(m => (m === 'dark' ? 'light' : 'dark')),
  }), [mode])

  const theme = useMemo(() => getTheme(mode), [mode])

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export function useColorMode() {
  return useContext(ColorModeContext)
}
