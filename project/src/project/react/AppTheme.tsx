import { createTheme } from '@mui/material/styles';
import { deepOrange, red } from '@mui/material/colors';
import { darkScrollbar } from '@mui/material';

// A custom theme for this app
const AppTheme = createTheme({
  palette: {
    primary: {
      //main: '#D83715',
      main: '#FFFFFF',
      light: '#EEEEEE',
      dark: "#90caf9",
      contrastText: "#2b588a"
    },
    secondary: {
      main: '#90caf9',
      //light: '#EEEEEE',
      //dark: "#2b588a",
      //contrastText: "#2b588a"
    },
    error: {
      main: red.A400,
    },
    warning: {
      main: '#2b588a',
    },
    background: {
      //default: "#1565c0",
      //paper: "#1565c0",
      //default: "#2b588a", 
      paper: "#2b588a",

    },
    
    
    divider: "#EEEEEE",
    text: {
      primary: "#FFFFFF",
      secondary: "#EEEEEE",
    }
  },
  typography: {
    fontFamily: [
      'EduSABeginner',
      'sans-serif',
    ].join(','),
    fontSize: 16,

    
  },
  components: {
    MuiTooltip: {
        styleOverrides: {
            tooltip: {
                fontSize: '1em'
            }
        }
    },
    MuiCssBaseline: {styleOverrides: (themeParam) => ({
        body: darkScrollbar({track:"#2b588a", thumb:"#BBBBBB", active:"#FFFFFF"}) ,
      }),
    }
  }

  
  



});



export default AppTheme;
