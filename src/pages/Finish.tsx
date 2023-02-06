import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { removeOperator } from "@/common/contract";
import Loading from "@/components/Loading";
import { clearSetting, cleatProgress } from "@/common/session";

const Finish = () => {
  const [isLoading, setLoading] = useState(false);
  const [isShowingError, setShowingError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <>
      <Loading open={isLoading} message={"Loading..."} />

      {/*Error Dialog*/}
      <Dialog
        open={isShowingError}
        onClose={() => {
          setShowingError(false);
        }}
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-description"
      >
        <DialogTitle id="error-dialog-title">{"Oops"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="error-dialog-description">
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowingError(false);
            }}
            autoFocus
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h3" variant="h5">
          Finally!
        </Typography>
        <Box
          sx={{
            marginTop: 2,
          }}
        >
          <Typography>
            Migration is now finished, thanks for your patience.
            <br />
            Don't forget to unauthorizing the operator, for safety concerns!
          </Typography>
          <Button
            type="button"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={async () => {
              try {
                setLoading(true);
                await removeOperator();
                window.close();
              } catch (e: any) {
                console.log(e);
                setErrorMessage(e.message);
                setShowingError(true);
              }

              // Clear settings and progress
              clearSetting();
              cleatProgress();
              setLoading(false);
            }}
          >
            Unauthorize Operator
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Finish;
