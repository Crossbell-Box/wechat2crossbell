import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
} from "@mui/material";
import { Casino, PowerSettingsNewOutlined } from "@mui/icons-material";
import { getSetting, setSetting } from "@/common/session";
import {
  addOperator,
  checkOperator,
  generateRandomPrivateKey,
  getSignerAddress,
  getSignerBalance,
  initWithPrivateKey,
  setContractCharacterHandle,
} from "@/common/contract";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";

const Settings = () => {
  const nav = useNavigate();

  const [privateKey, setPrivateKey] = useState("");
  const [characterHandle, setCharacterHandle] = useState("");

  const [isShowingError, setShowingError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isShowingGetCSB, setShowingGetCSB] = useState(false);
  const [isShowingAddOperator, setShowingAddOperator] = useState(false);
  const [signerAddress, setSignerAddress] = useState("");

  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const setting = getSetting();

    console.log(setting);

    setCharacterHandle(setting.characterHandle);
  }, []);

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

      {/*Get CSB Dialog*/}
      <Dialog
        open={isShowingGetCSB}
        onClose={() => {
          setShowingGetCSB(false);
        }}
        aria-labelledby="get-csb-dialog-title"
        aria-describedby="get-csb-dialog-description"
      >
        <DialogTitle id="add-operator-dialog-title">
          {"Insufficient $CSB balance"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="add-operator-dialog-description">
            The signer has insufficient $CSB balance, <br />
            it's better to visit faucet for some.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowingGetCSB(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setShowingGetCSB(false);
              window.open(
                `https://faucet.crossbell.io/?address=${signerAddress}`,
                "_blank"
              );
            }}
            variant="contained"
            autoFocus
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>

      {/*Bind Operator Dialog*/}
      <Dialog
        open={isShowingAddOperator}
        onClose={() => {
          setShowingAddOperator(false);
        }}
        aria-labelledby="add-operator-dialog-title"
        aria-describedby="add-operator-dialog-description"
      >
        <DialogTitle id="add-operator-dialog-title">
          {"No operator permissions"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="add-operator-dialog-description">
            Current address is not authorized to sync for you: <br />
            {signerAddress} <br />
            But we can fix it. We are going to call MetaMask on your browser.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowingAddOperator(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setShowingAddOperator(false);
              setLoading(true);
              try {
                await addOperator();
              } catch (e: any) {
                console.log(e);
                setErrorMessage(e.message);
                setShowingError(true);
              }
              setLoading(false);
            }}
            variant="contained"
            autoFocus
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>

      {/*Page*/}
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <PowerSettingsNewOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Settings
        </Typography>
        <Box component="div" sx={{ mt: 1 }}>
          <Grid>
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="signer-private-key">
                Signer Private Key
              </InputLabel>
              <OutlinedInput
                id="signer-private-key"
                type="password"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => {
                        const pk = generateRandomPrivateKey();
                        setPrivateKey(pk);
                      }}
                      edge="end"
                    >
                      <Casino />
                    </IconButton>
                  </InputAdornment>
                }
                required
                value={privateKey}
                onChange={(ev) => {
                  setPrivateKey(ev.target.value);
                }}
                label="Signer Private Key"
              />
            </FormControl>
            <TextField
              margin="normal"
              required
              fullWidth
              name="characterHandle"
              label="Crossbell Character Handle"
              type="text"
              value={characterHandle}
              onChange={(ev) => {
                setCharacterHandle(ev.target.value);
              }}
            />
          </Grid>
          <Button
            type="button"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={async () => {
              // Start loading
              setLoading(true);

              // Save settings
              setSetting({
                characterHandle,
              });

              try {
                // Set Character handle
                await setContractCharacterHandle(characterHandle);

                // Use private key to initialize
                await initWithPrivateKey(privateKey);

                // Set signer address
                setSignerAddress(getSignerAddress());

                // Check operator CSB balance
                const signerCSBBalance =
                  (await getSignerBalance()) / Math.pow(10, 18);
                console.log("Signer's CSB: ", signerCSBBalance);
                if (signerCSBBalance > 0.01) {
                  // Check operator
                  if (await checkOperator()) {
                    // Finally
                    // Redirect
                    nav("/migrate");
                  } else {
                    console.log("Oops, this operator is not authorized.");
                    setShowingAddOperator(true);
                  }
                } else {
                  setShowingGetCSB(true);
                }
              } catch (e: any) {
                console.log(e);
                // Notify
                console.log("Oops, something is wrong.");
                setErrorMessage(e.message);
                setShowingError(true);
              }

              setLoading(false);
            }}
          >
            Start!
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Settings;
