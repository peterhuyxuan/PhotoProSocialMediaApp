import React from "react";
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { db } from "../../backend/Firebase";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import { FullscreenExit } from "@material-ui/icons";


function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
    // got from PhotoUpload (paper)
    paper: {
      position: "absolute",
      width: 200,
      height: 100,
      backgroundColor: "#fafafa",
      border: "2px solid #DDDFE2",
      outline: "none",
      boxShadow: theme.shadows[5],
      borderRadius: "20px",
      display: "flex", 
      flexDirection: "column",
    },
  }));

export default function Bookmark(props) {

    const { profile, userId, postId} = props;
    const [open, setOpen] = React.useState(false);
    const [modalStyle] = React.useState(getModalStyle);
    const classes = useStyles();

    const handleClose = () => {
        setOpen(false);
      };

    const handleDelete = () => {
        setOpen(true);
    };


    const removePost = () => {
        db.collection("posts").doc(postId).delete();
        setOpen(false);
    }
    

    return (
        <>

        <Modal open={open} onClose={handleClose} >
        <div style={modalStyle} className={classes.paper}>
            <div className="deleteHeading">
              <p>Delete Post?</p>
            </div>
            <div className="deleteYesNo">
              <div className="YesNo">
              <button className="deletebutton" onClick={removePost}>Yes</button>
              </div>
              <div className="YesNo">
            <button className="deletebutton" onClick={handleClose}>Cancel</button>
            </div>
            </div>

        </div>
        </Modal>
        {profile === userId ? (
            <IconButton aria-label="delete"  className="deleteButton" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>

          ) : undefined}
    
    </>
    );
}