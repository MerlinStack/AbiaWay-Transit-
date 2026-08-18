import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4ade80',
      light: '#86efac',
      dark: '#15803d',
    },
    secondary: {
      main: '#60a5fa',
      light: '#93c5fd',
      dark: '#2563eb',
    },
    background: {
      default: '#07101f',
      paper: 'rgba(15, 23, 42, 0.95)',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    h1: {
      fontFamily: ['Sora', 'Inter', 'sans-serif'].join(','),
      fontWeight: 800,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontFamily: ['Sora', 'Inter', 'sans-serif'].join(','),
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: ['Sora', 'Inter', 'sans-serif'].join(','),
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontFamily: ['Sora', 'Inter', 'sans-serif'].join(','),
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontFamily: ['Sora', 'Inter', 'sans-serif'].join(','),
      fontWeight: 600,
    },
    h6: {
      fontFamily: ['Sora', 'Inter', 'sans-serif'].join(','),
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 20,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          fontFamily: ['Sora', 'Inter', 'sans-serif'].join(','),
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(148, 163, 184, 0.14)',
          boxShadow: '0 12px 32px rgba(2, 6, 23, 0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(15, 23, 42, 0.97)',
          backdropFilter: 'blur(24px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
