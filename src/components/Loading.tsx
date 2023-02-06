import React from "react";
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";

interface LoadingProps {
  open: boolean;
  message: string;
}
const Loading = ({ open, message }: LoadingProps) => (
  <Backdrop
    sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
    open={open}
  >
    <Box
      component="div"
      sx={{ mt: 1 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem",
      }}
    >
      <CircularProgress color="inherit" />
      <Typography component="h3" variant="h5">
        {message}
      </Typography>
    </Box>
  </Backdrop>
);

export default Loading;
