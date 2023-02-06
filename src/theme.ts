import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: "#F6C549",
    },
    secondary: {
      main: "#6AD991",
    },
    error: {
      main: "#E65040",
    },
  },
});

export default theme;
