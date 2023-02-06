import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { WechatExportMoment, signerPostNote } from "@/common/contract";
import Loading from "@/components/Loading";
import { getProgress, getSetting, setProgress } from "@/common/session";
import { AccessTime, Add, AddTask, Check } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface messagesPendingMigration {
  // Original message data
  moment: WechatExportMoment;

  // Let user select this
  isToMigrate: boolean;

  // Status
  isPendingMigrate: boolean;
  isMigrated: boolean;
}

const Migrate = () => {
  const [isLoading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(
    "Loading collections..."
  );

  const [isShowingError, setShowingError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [messages, setMessages] = useState<messagesPendingMigration[]>([]);

  const loadMessages = async () => {
    // Set
    setLoadingMessage("Loading messages...");
    setLoading(true);

    // Get settings
    try {
      // Prepare callback function

      (window as any).callback = ({
        moments,
      }: {
        moments: WechatExportMoment[];
      }) => {
        const parsedMoments = moments.map(
          (moment): messagesPendingMigration => {
            return {
              moment: moment,
              isToMigrate: true,
              isPendingMigrate: false,
              isMigrated: false,
            };
          }
        );

        console.log("Parsed moments: ", parsedMoments);

        setMessages(parsedMoments);
      };

      // Load js file

      const groupScript = document.createElement("script");
      groupScript.src = "Assets/moments.js";
      groupScript.async = true;
      document.body.appendChild(groupScript);
    } catch (e: any) {
      setErrorMessage(e.message);
      setShowingError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const nav = useNavigate();

  return (
    <>
      <Loading open={isLoading} message={loadingMessage} />

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
        <Typography component="h1" variant="h5">
          Migrate
        </Typography>

        <Box
          sx={{
            marginTop: 2,
          }}
        >
          <Button
            type="button"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={async () => {
              setLoading(true);
              setLoadingMessage("Initializing basic information...");

              setProgress({
                ...getProgress(),
                finishedIDs: [],
              });

              try {
                for (let index = 0; index < messages.length; index++) {
                  const wrappedMessage = messages[index];
                  setLoadingMessage(
                    `Processing ${index} of ${messages.length} notes...`
                  );
                  if (wrappedMessage.isToMigrate) {
                    setMessages(
                      messages
                        .slice(0, index)
                        .concat([
                          {
                            ...wrappedMessage,
                            isPendingMigrate: true,
                          },
                        ])
                        .concat(messages.slice(index + 1, messages.length))
                    );
                    await signerPostNote(wrappedMessage.moment);
                    setMessages(
                      messages
                        .slice(0, index)
                        .concat([
                          {
                            ...wrappedMessage,
                            isPendingMigrate: false,
                            isMigrated: true,
                          },
                        ])
                        .concat(messages.slice(index + 1, messages.length))
                    );
                  }
                }

                console.log("All finished");

                nav("/finish");
              } catch (e: any) {
                console.log(e);
                setErrorMessage(e.message);
                setShowingError(true);
              }

              setLoading(false);
            }}
          >
            Start processing
          </Button>
        </Box>

        <Box display={"flex"} flexDirection={"row"} width={"100%"} mt={8}>
          <Box flex={1}>
            <List>
              {messages.map((wrappedMessage, index) => (
                <ListItem key={index}>
                  <ListItemButton
                    onClick={() => {
                      setMessages(
                        messages
                          .slice(0, index)
                          .concat([
                            {
                              ...wrappedMessage,
                              isToMigrate: !wrappedMessage.isToMigrate,
                            },
                          ])
                          .concat(messages.slice(index + 1, messages.length))
                      );
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge={"start"}
                        checked={wrappedMessage.isToMigrate}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          {wrappedMessage.moment.title && (
                            <h3>{wrappedMessage.moment.title}</h3>
                          )}
                          {wrappedMessage.moment.content && (
                            <span>{wrappedMessage.moment.content}</span>
                          )}
                          {/*Photo*/}
                          {wrappedMessage.moment.medias && (
                            <div
                              style={{
                                display: "inline-block",
                              }}
                            >
                              {wrappedMessage.moment.medias.map((media) => (
                                <img
                                  key={media.content}
                                  src={media.content}
                                  alt={media.description}
                                  width={240}
                                  height={240}
                                  style={{
                                    objectFit: "cover",
                                    margin: 4,
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </Box>
                      }
                      secondary={new Date(
                        wrappedMessage.moment.create_time
                      ).toLocaleString()}
                      style={{
                        whiteSpace: "pre-wrap",
                      }}
                    />
                    <ListItemIcon>
                      {wrappedMessage.isMigrated ? (
                        <Check />
                      ) : wrappedMessage.isPendingMigrate ? (
                        <AccessTime />
                      ) : wrappedMessage.isToMigrate ? (
                        <AddTask />
                      ) : (
                        <></>
                      )}
                    </ListItemIcon>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Migrate;
