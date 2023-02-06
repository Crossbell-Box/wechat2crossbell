import React, { useCallback, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Intro = () => {
  const nav = useNavigate();

  const schemaCheck = useCallback(() => {
    const schema = window.location.protocol;
    if (schema !== "http:" && schema !== "https:") {
      nav("/error");
    }
  }, [nav]);

  useEffect(() => {
    schemaCheck();
  }, []);

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
        Welcome !
      </Typography>
      <Box
        sx={{
          marginTop: 2,
        }}
      >
        <Typography>
          Welcome to Wechat2Crossbell, this is a small tool that can <br />
          help you post all exported wechat moments to crossbell automatically.{" "}
          <br />
          <br />
          In the following page you will able to set your character <br />
          and signer private key. Please ensure the signer has <br />
          enough gas or the transactions would be fail. <br />
          <br />
          What's the signer private key? We need a signer to proceed the <br />
          automation works, so you won't need to sign for every single <br />
          transaction. It can be everything. If not sure, just generate <br />
          a random one should be fine. DON'T use any valuable ones <br />
          because it could be dangerous to expose them. <br />
          <br />
          For safety concerns, private keys won't be saved into checkpoint.
        </Typography>
        <Button
          type="button"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={() => {
            nav("/settings");
          }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default Intro;
