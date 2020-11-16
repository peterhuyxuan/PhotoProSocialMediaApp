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

// Styles for the like button
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

// Component for the like button
export default function Likes(props) {
  const classes = useStyles();

  const { id: userId } = useAppUser() || {};

  const { id: postId, numberOfLikes, tags } = props;

  const [likes, setLikes] = React.useState([]);
  const [hasLiked, setHasLiked] = React.useState(false);
  const [numberLikes, setNumberLikes] = React.useState(numberOfLikes);

  // Getting all of the users who liked the post and how many people liked the post
  React.useEffect(() => {
    let unsubscribeLikes;
    let unsubscribeNumberLikes;
    if (postId) {
      unsubscribeLikes = db
        .collection("posts")
        .doc(postId)
        .collection("likes")
        .onSnapshot((snapshot) => {
          setLikes(snapshot.docs.map(({ id }) => id));
        });
    }
    if (postId) {
      unsubscribeNumberLikes = db
        .collection("posts")
        .doc(postId)
        .onSnapshot((doc) => {
          setNumberLikes(doc.data().numberOfLikes);
        });
    }
    return () => {
      unsubscribeLikes();
      unsubscribeNumberLikes();
    };
  }, [postId, numberLikes]);

  // Determing whether the user like the post or not
  React.useEffect(() => {
    var docRef = db // quering
      .collection("posts")
      .doc(postId)
      .collection("likes")
      .doc(userId); // checking if a certain user ID has a post liked
    docRef.get().then(function (doc) {
      if (doc.exists) {
        // if they have liked the image
        db.collection("posts")
          .doc(postId)
          .get()
          .then(function (doc) {
            // Making sure the post is liked if the post has more than 0 likes
            if (doc.data().numberOfLikes !== 0) {
              setHasLiked(true);
            } else {
              setHasLiked(false);
            }
          });
      }
    });
  }, [likes, hasLiked, postId, userId]);

  // Following the tags of the post after the user likes the post
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

  // Logic to process and render when the user likes the post and updates it to Firebase
  const handleLike = (event) => {
    event.preventDefault();
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
      if (numberLikes - 1 < 0) {
        likeAmount = 0;
        setNumberLikes(0);
      } else {
        likeAmount = -1;
        setNumberLikes(numberLikes - 1);
      }
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
        numberOfLikes:
          numberOfLikes + likeAmount < 0 ? 0 : numberOfLikes + likeAmount,
      });
  };

  // Rendering the like and unliked button
  return (
    <>
      <IconButton
        className={clsx(classes.liked, {
          [classes.unliked]: !hasLiked,
        })}
        aria-label="liked"
        onClick={handleLike}
        style={{
          outline: "none !important",
        }}
      >
        <FavoriteIcon style={{ outline: "none !important" }} />
      </IconButton>
      <Typography paragraph style={{ marginTop: 17.5, marginLeft: 10 }}>
        {numberLikes}
      </Typography>
    </>
  );
}
