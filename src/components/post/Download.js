import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import GetAppIcon from "@material-ui/icons/GetApp"; // download button icon
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  // got from PhotoUpload (paper)
  paper: {
    position: "absolute",
    width: 500,
    height: 343,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #DDDFE2",
    outline: "none",
    boxShadow: theme.shadows[5],
    borderRadius: "5px",
  },
  // --------------
  buyButton: {
    margin: theme.spacing(1),
  },
}));

export default function Download(props) {
  const classes = useStyles();
  const { hasPurchased, imageURL } = props;
  const [openDownloadDialog, setOpenDownloadDialog] = React.useState(false);

  const handleDownloadClose = () => {
    setOpenDownloadDialog(false);
  };

  const handleDownload = () => {
    setOpenDownloadDialog(true);
  };

  function generateDownloadPopupContent() {
    if (hasPurchased) {
      return "Here is the download link";
    } else {
      return "It appears you have not bought this image yet!";
    }
  }

  function generateDownloadButton() {
    if (hasPurchased) {
      return (
        // generate the download button if they have bought it
        <Button
          onClick={handledownloadLink}
          color="primary"
          style={{ outline: "none" }}
        >
          Download
        </Button>
      );
    }
  }

  function handledownloadLink() {
    // open the image original in a new tab
    window.open(imageURL, "_blank");
  }

  return (
    <div>
      <Button
        className={classes.downloadButton}
        variant="contained"
        color="default"
        size="small"
        startIcon={<GetAppIcon />}
        onClick={handleDownload}
        style={{ outline: "none" }}
      >
        Download
      </Button>
      <Dialog
        open={openDownloadDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Download the original file"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {generateDownloadPopupContent()}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDownloadClose}
            color="primary"
            style={{ outline: "none" }}
          >
            Close
          </Button>
          {generateDownloadButton()}
        </DialogActions>
      </Dialog>
    </div>
  );
}
