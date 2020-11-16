import React from "react";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import { db } from "../../backend/Firebase";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";

// the position of the modal
function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

// creating style for the modal
const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 200,
    height: 140,
    backgroundColor: "#fafafa",
    border: "2px solid #DDDFE2",
    outline: "none !important",
    boxShadow: theme.shadows[5],
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
  },
}));

// deletes a post
export default function DeleteComment(props) {
  // obtaining variables passed in from Post and searchFeedPost
  const { commentId, profile, commentUser, postId, currentUser } = props;
  // used for the modal
  const [open, setOpen] = React.useState(false);
  const [modalStyle] = React.useState(getModalStyle);
  const classes = useStyles();
  // set Open to false to close the modal
  const handleClose = () => {
    setOpen(false);
  };
  // when delete button is clicked, it opens the modal
  const handleDelete = () => {
    console.log(props);
    setOpen(true);
  };

  // removes the comment from firebase, and closes the modal
  const removeComment = () => {
    (async () => {
      await db
        .collection("posts")
        .doc(postId)
        .collection("comments")
        .doc(commentId)
        .delete();
    })();
    setOpen(false);
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <div style={modalStyle} className={classes.paper}>
          <div className="deleteHeading">
            <p>Delete Comment?</p>
          </div>
          <div className="deleteYesNo">
            <div className="YesNo">
              <button className="deletebutton" onClick={removeComment}>
                Yes
              </button>
            </div>
            <div className="YesNo">
              <button className="deletebutton" onClick={handleClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Modal>
      {/*the delete button only appears on a comment if it is the users comment OR the users post*/}
      {commentUser === currentUser || profile === currentUser ? (
        <IconButton
          aria-label="delete"
          className="deleteCommentButton"
          onClick={handleDelete}
          style={{
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            marginTop: "-14px",
            marginRight: "10px",
          }}
        >
          <DeleteIcon
            style={{
              outline: "none !important",
            }}
          />
        </IconButton>
      ) : undefined}
    </>
  );
}
