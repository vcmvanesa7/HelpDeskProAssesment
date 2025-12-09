import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#111111" }, 
    secondary: { main: "#c7e76a" }, 
    text: {
      primary: "#111111",
      secondary: "#5a5a5a",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    }
  },

  typography: {
    fontFamily: "var(--font-inter-tight)",

    h4: {
      fontFamily: "var(--font-bebas)",
      fontSize: "2.4rem",
      letterSpacing: "1px",
    },

    h6: {
      fontFamily: "var(--font-inter-tight)",
      fontWeight: 600,
    },
  },

  components: {
    //NAVBAR / TOOLBAR SLIM MODE
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: "48px !important",   // altura slim KOI
          paddingLeft: "16px",
          paddingRight: "16px",
          "@media (min-width:600px)": {
            minHeight: "56px !important", // desktop limpio
          },
        },
      },
    },

    // Inputs
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: "#fff",
          borderRadius: 10,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#dcdcdc",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#c7e76a",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#111111",
          },
        },
      },
    },

    // Buttons
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontFamily: "var(--font-bebas)",
          fontSize: "1.1rem",
          letterSpacing: 1,
          textTransform: "none",    
        },
        containedPrimary: {
          backgroundColor: "#111111",
          color: "#fff",
          "&:hover": { backgroundColor: "#333" },
        },
        outlined: {
          borderColor: "#c7e76a",
          color: "#111111",
          "&:hover": {
            borderColor: "#111111",
            color: "#111111",
          },
        },
      },
    },

    // Badge
    MuiBadge: {
      styleOverrides: {
        badge: {
          backgroundColor: "#111",
          color: "#fff",
          fontSize: "0.7rem",
          padding: "0 4px",
        },
      },
    },
  },
});

export default theme;
