import React from "react";
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

// Position of Modal 
function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

// Style of Modal and bookmark 
const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: "400px",
    height: 343,
    backgroundColor: "#fafafa",
    border: "2px solid #DDDFE2",
    outline: "none !important",
    boxShadow: theme.shadows[5],
    borderRadius: "20px",
  },
  bookmarked: {
    outline: "none !important",
    float: "right",
    color: red[500],
  },
  unbookmarked: {
    outline: "none !important",
    float: "right",
    color: theme.palette.action.active,
  },
}));

// return id of the collection
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

  // close Modal 
  const handleClose = () => {
    setOpen(false);
  };

  // when bookmark is clicked 
  const handleClick = () => {

    // get value of bookmarked as boolean and postid passed in from post/searchfeedpost
    const { bookmarked, id: postId } = props;

    // if it is not bookmarked open the modal
    if (!bookmarked) {
      return setOpen(true);
    }

    // if bookmarked, remove postId from all user collections
    const collectionIds = collections.map(({ id }) => id);
    collectionIds.forEach((collectionId) => {
      dbRefCollection(userId, collectionId).update({
        posts: arrayRemove(postId),
      });
    });
  };

  // add the post to the collection
  const handleAddToCollection = (collectionId) => {
    const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
    const { id } = props;
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

  // creating a new collection
  const addCollection = (e) => {
    if (e.key === "Enter" && newCollection.trim().length > 0) {
      db.collection("users")
        .doc(userId)
        .collection("photoCollections")
        .doc(newCollection.trim())
        .set({
          posts: [],
        });
      setNewCollection("");
    }
  };

  // set the tags of the bookmarked post to tagsfollowed collection within database
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
        })
        .catch(() => {
          console.error(`Error writing tag: ${tag}`);
        });
    });
  }

  return (
    <>

      {/*Modal for adding to/creating collection*/}
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

              {/*Input for creating a new collection*/}
              <input
                type="text"
                style={{ outline: "none" }}
                onChange={(e) => setNewCollection(e.target.value)}
                placeholder={"Add a new Collection!"}
                onKeyDown={addCollection}
                className="addtoCollectionInput"
                value={newCollection}
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

      {/*Bookmark Icon*/}
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
