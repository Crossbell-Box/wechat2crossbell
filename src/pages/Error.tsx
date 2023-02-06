import React from "react";
import { Box, Typography } from "@mui/material";

const Error = () => {
  return (
    <Box
      sx={{
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography component="h3" variant="h5">
        Failed to detect necessary data
      </Typography>
      <Box
        sx={{
          marginTop: 2,
        }}
      >
        <Typography>
          It seems we cannot detect necessary data. <br />
          Please put these files into your Wechat exported data's directory.{" "}
          <br />
          Or maybe this site is opened directly? In that case it won't work,{" "}
          <br />
          please use a http server.
        </Typography>
      </Box>
    </Box>
  );
};

export default Error;
