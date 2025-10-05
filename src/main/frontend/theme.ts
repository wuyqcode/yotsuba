import { createTheme, alpha, ThemeOptions } from '@mui/material/styles';
import type {} from '@mui/material/themeCssVarsAugmentation';

// 定义自定义断点
const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
};

// 创建主题
const theme = createTheme({
  // 调色板
  palette: {
    mode: 'light',
    primary: {
      main: '#88C0D0', // Nord 冰蓝
      light: '#A8D5E2',
      dark: '#6B9BA8',
    },
    secondary: {
      main: '#5E81AC', // 深蓝
      light: '#7B97BE',
      dark: '#4B6789',
    },
    error: {
      main: '#BF616A',
      light: '#D47F87',
      dark: '#994D54',
    },
    warning: {
      main: '#EBCB8B',
      light: '#F0D9A8',
      dark: '#BCA26F',
    },
    success: {
      main: '#A3BE8C',
      light: '#B9CFA7',
      dark: '#829870',
    },
    background: {
      default: '#ECEFF4',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2E3440',
      secondary: '#4C566A',
    },
    divider: '#D8DEE9',
  },

  // 断点配置
  breakpoints,

  // 形状
  shape: {
    borderRadius: 8,
  },

  // 排版
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },

  // 组件默认样式
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#ECEFF4',
          scrollBehavior: 'smooth',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 16,
          '&:last-child': {
            paddingBottom: 16,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: '0.75rem',
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 8,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&:hover': {
            backgroundColor: 'var(--yotsuba-palette-primary-8)',
          },
        },
      },
    },
  },
});

export default theme;
