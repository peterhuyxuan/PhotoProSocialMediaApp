import React from "react";
import Button from "@material-ui/core/Button";
import BookmarksIcon from "@material-ui/icons/Bookmarks";
import clsx from "clsx";
import IconButton from "@material-ui/core/IconButton";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import { db } from "../../backend/Firebase";
import firebase from "firebase";
import useAppUser from "../../hooks/useAppUser";
import CloseIcon from "@material-ui/icons/Close";
import "./Post.css";

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
    width: "400px",
    height: 343,
    backgroundColor: "#fafafa",
    border: "2px solid #DDDFE2",
    outline: "none",
    boxShadow: theme.shadows[5],
    borderRadius: "20px",
  },
  bookmarked: {
    outline: "none",
    float: "right",
    color: red[500],
  },
  unbookmarked: {
    outline: "none",
    float: "right",
    color: theme.palette.action.active,
  },
}));

const dbRefCollection = (userId, collectionId) => {
  return db
    .collection("users")
    .doc(userId)
    .collection("photoCollections")
    .doc(collectionId);
};

const arrayRemove = firebase.firestore.FieldValue.arrayRemove;

export default function Bookmark(props) {
  const { id: userId, collections = [] } = useAppUser() || {};
  const { bookmarked, tags } = props;
  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);
  const [progress] = React.useState(0);
  const [newCollection, setNewCollection] = React.useState("");

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = () => {
    const { bookmarked, id: postId } = props;

    if (!bookmarked) {
      return setOpen(true);
    }

    // if bookmarked, remove possible postId from all user collections
    const collectionIds = collections.map(({ id }) => id);
    collectionIds.forEach((collectionId) => {
      dbRefCollection(userId, collectionId).update({
        posts: arrayRemove(postId),
      });
    });
  };

  const handleAddToCollection = (collectionId) => {
    const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
    const { id } = props;
    // console.log(collectionId);
    db.collection("users")
      .doc(userId)
      .collection("photoCollections")
      .doc(collectionId)
      .update({
        posts: arrayUnion(id),
      });
    addTag();
    setOpen(false);
  };

  const addCollection = (e) => {
    if (e.key === "Enter") {
      db.collection("users")
        .doc(userId)
        .collection("photoCollections")
        .doc(newCollection)
        .set({
          posts: [],
        });
    }
  };

  function addTag() {
    tags.forEach((tag, index) => {
      db.collection("users")
        .doc(userId)
        .collection("tagsFollowed")
        .doc(tag)
        .set({
          tagLower: tag,
          timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          // console.log(`Added tag: ${tag}`);
        })
        .catch(() => {
          console.error(`Error writing tag: ${tag}`);
        });
    });
  }

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <div className="imageupload">
          <div style={modalStyle} className={classes.paper}>
            <IconButton className="closeButton" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
            <h5 className="collectionHeading">Add to Collection</h5>
            <div className="collectionButtonDivs">
              {collections.map(({ id, post }) => (
                <button
                  onClick={() => handleAddToCollection(id)}
                  className="addtoCollectionButton"
                >
                  {id}
                </button>
              ))}

              <br />
              <input
                type="text"
                onChange={(e) => setNewCollection(e.target.value)}
                placeholder={"Add a new Collection!"}
                onKeyDown={addCollection}
                className="addtoCollectionInput"
              />
            </div>
          </div>
          <progress
            value={progress}
            max="100"
            className={`progress ${progress && "show"}`}
          />
        </div>
      </Modal>
      <IconButton
        className={clsx(classes.bookmarked, {
          [classes.unbookmarked]: !bookmarked,
        })}
        onClick={handleClick}
        aria-label="bookmark"
      >
        <BookmarksIcon style={{ outline: "none" }} />
      </IconButton>
    </>
  );
}
