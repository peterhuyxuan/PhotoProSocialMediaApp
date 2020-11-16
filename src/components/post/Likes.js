import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import clsx from "clsx";
import FavoriteIcon from "@material-ui/icons/Favorite";
import IconButton from "@material-ui/core/IconButton";
import useAppUser from "../../hooks/useAppUser";
import { db } from "../../backend/Firebase";
import firebase from "firebase";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  liked: {
    outline: "none !important",
    color: red[500],
  },
  unliked: {
    outline: "none !important",
    color: theme.palette.action.active,
  },
}));

export default function Likes(props) {
  const classes = useStyles();

  const { id: userId } = useAppUser() || {};

  const { id: postId, liked, numberOfLikes, tags } = props;

  const [hasLiked, setHasLiked] = React.useState(liked);
  const [numberLikes, setNumberLikes] = React.useState(numberOfLikes);

  React.useEffect(() => {
    let unsubscribeLikes;
    if (postId) {
      unsubscribeLikes = db
        .collection("posts")
        .doc(postId)
        .onSnapshot((doc) => {
          setNumberLikes(doc.data().numberOfLikes);
        });
    }
    return () => {
      unsubscribeLikes();
    };
  }, [postId, numberLikes]);

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

  const handleLike = (event) => {
    event.preventDefault();
    // console.log(numberLikes);
    let likeAmount;
    let likedStatus;
    if (!hasLiked) {
      setHasLiked(true);
      setNumberLikes(numberLikes + 1);
      likeAmount = 1;
      likedStatus = true;
      db.collection("posts").doc(postId).collection("likes").doc(userId).set({
        liked: true,
        tags: tags,
      });
      addTag();
    } else {
      setHasLiked(false);
      setNumberLikes(numberLikes - 1);
      likeAmount = -1;
      likedStatus = false;
      db.collection("posts")
        .doc(postId)
        .collection("likes")
        .doc(userId)
        .delete();
    }

    db.collection("posts")
      .doc(postId)
      .update({
        liked: likedStatus,
        numberOfLikes: numberOfLikes + likeAmount,
      });
  };

  return (
    <>
      <IconButton
        className={clsx(classes.liked, {
          [classes.unliked]: !hasLiked,
        })}
        aria-label="liked"
        onClick={handleLike}
        style={{
          outline: "none !important"

        }}
      >
        <FavoriteIcon style={{ outline: "none !important"}} />
      </IconButton>
      <Typography paragraph style={{ marginTop: 17.5, marginLeft: 10 }}>
        {numberLikes}
      </Typography>
    </>
  );
}
