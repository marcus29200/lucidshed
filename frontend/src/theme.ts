import "@fontsource/poppins";
import { createTheme } from "@mui/material/styles";

// extend palette options to include custom colors and palette options
declare module '@mui/material/styles' {
  interface Palette {
    neutral?: Palette;
    dark?: Palette;
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
    dark?: PaletteOptions['primary'];
  }

  interface PaletteColor {
    darker?: string;
    lighter?: string;
    lightest?: string;
  }

  interface SimplePaletteColorOptions {
    darker?: string;
    lighter?: string;
    lightest?: string;
  }
}

// enable use of non-standard colors for buttons
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    neutral: true;
    dark: true
  }
}

export const theme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textAlign: 'left'
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12
        }
      }
    },
  },
  typography: {
    fontFamily: [
      'Poppins',
      'system-ui',
      'sans-serif'
    ].join(),
    button: {
      textTransform: 'none'
    }
  },
  palette: {
    primary: {
      lightest: '#DFF6F3',
      lighter: '#BFEDE8',
      light: '#80DBD0',
      main: '#20A224',
      dark: '#18771B',
      darker: '#0D440F',
    },
    secondary: {
      lightest: '#FCF5D9',
      lighter: '#F7E08D',
      light: '#F3D053',
      main: '#E5B710',
      dark: '#BF980D',
      darker: '#866B09',
    },
    error: { // corresponds to tertiary in the figma (frame 2372)
      lightest: '#FCD9E0',
      lighter: '#F9B4C1',
      light: '#F36884',
      main: '#ED254E',
      dark: '#BD0F32',
      darker: '#840B23',
    },
    neutral: {
      lightest: '#E9EAEC',
      lighter: '#D3D5D9',
      light: '#A7AAB4',
      main: '#717584',
    },
    dark: {
      main: '#242831',
      contrastText: "#fff"
    }
  }
})
