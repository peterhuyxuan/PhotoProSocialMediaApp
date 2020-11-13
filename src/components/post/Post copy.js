import React from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import clsx from "clsx";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Chip from "@material-ui/core/Chip";
import Collapse from "@material-ui/core/Collapse";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { red } from "@material-ui/core/colors";
import FavoriteIcon from "@material-ui/icons/Favorite";
import BookmarksIcon from "@material-ui/icons/Bookmarks";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import CardHeader from "../CardHeader";
import { db } from "../../backend/Firebase";
import firebase from "firebase";
import { Link } from "react-router-dom";
import Modal from "@material-ui/core/Modal";
import "./Post.css";
import useAppUser from "../../hooks/useAppUser";
import GetAppIcon from "@material-ui/icons/GetApp"; // download button icon
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";

import DeleteIcon from "@material-ui/icons/Delete";
const arrayRemove = firebase.firestore.FieldValue.arrayRemove;

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
    width: 500,
    height: 343,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #DDDFE2",
    outline: "none",
    boxShadow: theme.shadows[5],
    borderRadius: "5px",
  },
  // --------------
  root: {
    padding: 20,
    width: "70%",
    marginTop: 20,
    marginBottom: 20,
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    // transform: "rotate(180deg)",
  },

  liked: {
    color: red[500],
  },
  unliked: {
    color: theme.palette.action.active,
  },
  bookmarked: {
    color: red[500],
  },
  unbookmarked: {
    color: theme.palette.action.active,
  },
  form: {
    "& > *": {
      margin: theme.spacing(1),
      width: "25ch",
    },
  },
  downloadButton: {
    margin: theme.spacing(1),
    marginLeft: 20,
  },
  buyButton: {
    margin: theme.spacing(1),
  },
}));

const dbRefCollection = (userId, collectionId) => {
  return db
    .collection("users")
    .doc(userId)
    .collection("photoCollections")
    .doc(collectionId);
};

export function Post(props) {
  const { id: userId, collections = [] } = useAppUser() || {};

  const { id: postId, bookmarked } = props;

  const classes = useStyles();
  const [comment, setComment] = React.useState("");
  const [comments, setComments] = React.useState([]);
  const [expanded, setExpanded] = React.useState(false);
  const [viewCommentText, setViewCommentText] = React.useState(
    "View all comments..."
  );
  const [hasLiked, setHasLiked] = React.useState(props.liked);
  const [numberLikes, setNumberLikes] = React.useState(props.numberOfLikes);

  const [imageURL, setImageURL] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const [openDownloadDialog, setOpenDownloadDialog] = React.useState(false);
  const [modalStyle] = React.useState(getModalStyle);
  const [progress] = React.useState(0);
  const [newCollection, setNewCollection] = React.useState("");
  const [purchased, setPurchased] = React.useState([]);
  const [hasPurchased, setHasPurchased] = React.useState(false);
  const [
    openPurchaseInstructions,
    setOpenPurchaseInstructions,
  ] = React.useState(false);
  const [openProceed, setOpenProceed] = React.useState(false);

  const history = useHistory("");

  React.useEffect(() => {
    let unsubscribeComment;
    let unsubscribePurchased;
    let unsubscribeLikes;
    if (postId) {
      unsubscribeComment = db
        .collection("posts")
        .doc(postId)
        .collection("comments")
        .orderBy("timeStamp", "desc")
        .onSnapshot((snapshot) => {
          setComments(snapshot.docs.map((doc) => doc.data()));
        });
      unsubscribePurchased = db
        .collection("posts")
        .doc(postId) // props.postId
        .collection("purchased")
        .onSnapshot((snapshot) => {
          setPurchased(snapshot.docs.map(({ id }) => id));
        });
      unsubscribeLikes = db
        .collection("posts")
        .doc(postId)
        .onSnapshot((doc) => {
          setNumberLikes(doc.data().numberOfLikes);
        });
    }
    return () => {
      unsubscribeComment();
      unsubscribePurchased();
      unsubscribeLikes();
    };
  }, [postId, comments, numberLikes]);

  const handleChangeText = (text) => setViewCommentText(text);

  const handleExpandClick = () => {
    if (expanded) {
      handleChangeText("View all comments...");
    } else {
      handleChangeText("View comments...");
    }
    setExpanded(!expanded);
  };

  // Clicking on tag chips redirects to a search for that tag
  const handleChipClick = (event) => {
    history.push({
      pathname: "/search",
      state: {
        searchText: event.target.textContent,
        searchType: "tag",
      },
    });
  };

  function addTag() {
    props.tags.forEach((tag, index) => {
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
        tags: props.tags,
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
        numberOfLikes: props.numberOfLikes + likeAmount,
      });
  };

  const handleDelete = () => {
    db.collection("posts").doc(postId).delete();
  };

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

  const handleBuy = () => {
    setOpenPurchaseInstructions(true);
  };

  const handleClosePurchaseInstructions = () => {
    setOpenPurchaseInstructions(false);
  };

  const handleProceed = () => {
    setOpenPurchaseInstructions(false);
    setOpenProceed(true);
  };

  const handleProceedCheck = () => {
    db.collection("users")
      .doc(userId)
      .get()
      .then((doc) => {
        const cardNo = doc.data().cardNo;
        if (cardNo.toString().length === 16) {
          db.collection("posts")
            .doc(postId)
            .collection("purchased")
            .doc(userId)
            .set({});
          addTag();
          setHasPurchased(true);
          setOpenProceed(false);
          alert("Your purchase is successful! You can now download the photo");
        } else {
          alert("Your credit is invalid");
          setOpenProceed(false);
        }
      });
  };

  const handleCloseProceed = () => {
    // setOpenPurchaseInstructions(false);
    setOpenProceed(false);
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

  const handlePostComment = (event) => {
    event.preventDefault();
    db.collection("posts").doc(postId).collection("comments").add({
      comment: comment,
      user: userId,
      timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    // TODO: Figure out to clear comment after posting as the code below doesn't work
    setComment("");
  };

  const addCollection = (e) => {
    if (e.key === "Enter") {
      // console.log("userId is " + userId);
      // console.log("new collection is " + newCollection);
      db.collection("users")
        .doc(userId)
        .collection("photoCollections")
        .doc(newCollection)
        .set({
          posts: [],
        });
    }
  };

  const handleDownloadClose = () => {
    setOpenDownloadDialog(false);
  };

  const handleDownload = () => {
    setOpenDownloadDialog(true);
  };

  function generateDownloadPopupContent() {
    if (hasPurchased) {
      // // console.log("purchased, show the download link");
      return "Here is the download link";
    } else {
      // // console.log("Not bought");
      return "It appears you have not bought this image yet!";
    }
  }

  function generateDownloadButton() {
    if (hasPurchased) {
      return (
        // generate the download button if they have bought it
        <Button onClick={handledownloadLink} color="primary">
          Download
        </Button>
        //<a href={props.imageURL} download={props.imageTitle} target="_blank">Download</a>
      );
    }
  }

  function handledownloadLink() {
    // open the image original in a new tab
    window.open(props.imageURL, "_blank");
  }

  React.useEffect(() => {
    var docRef = db // quering
      .collection("posts")
      .doc(postId)
      .collection("purchased")
      .doc(userId); // checking if a certain user ID has a post purchased
    docRef.get().then(function (doc) {
      if (doc.exists) {
        // if they have bought the image
        // console.log("purchased, show the download link");
        // return "Here is the download link";
        setHasPurchased(true);
      } else {
        setHasPurchased(false);
      }
    });
  }, [purchased, hasPurchased, postId, userId]);

  // TODO: Transfer all styles to CSS

  React.useEffect(() => {
    var docRef = db
      .collection("posts")
      .doc(postId) // props.postId
      .collection("purchased")
      .doc(userId);

    docRef
      // .doc(userId)
      .get()
      .then(function (doc) {
        if (doc.exists) {
          // then this person has bought this image, so show the original

          // console.log("doc is found");
          setImageURL(props.imageURL);
        } else {
          // they didn't buy it, so show watermarked version
          // console.log("doc not found");

          // set the watermarked image to be a constructed get request

          if (typeof props.imageURLWatermarked !== "undefined") {
            // then the image has a watermarked version stored in the database
            setImageURL(props.imageURLWatermarked);
            //return (props.imageURLWatermarked + "");
          } else {
            //return "watermarkedURL_is_undefined";
            // there is no version, so generate it
            var parsedURL = encodeURI(props.imageURL);
            var watermarkedAPIURLRequest =
              "https://textoverimage.moesif.com/image?image_url=" +
              parsedURL +
              "&text=SAMPLE&text_color=000000ff&text_size=64&x_align=center&y_align=middle";
            setImageURL(watermarkedAPIURLRequest);
          }
        }
      })
      .catch(function (error) {
        // console.log("Error getting document:", error);
      });
  }, [purchased, postId, userId, props.imageURL, props.imageURLWatermarked]);

  const calculateDate = (date) => {
    let hour = date.getHours();
    let minute = date.getMinutes();
    let amOrPM = (hour) => {
      if (hour > 12) {
        return "pm";
      } else {
        return "am";
      }
    };
    let dateObj = {
      hour: (hour < 10 ? "0" : "") + hour,
      minute: (minute < 10 ? "0" : "") + minute,
      amOrPM: amOrPM(hour),
    };
    return `${dateObj.hour}:${dateObj.minute}${dateObj.amOrPM}`;
  };

  return (
    <Card className={classes.root}>
      <Link to={`/profile/${props.profile}`}>
        <CardHeader title={props.profile} subheader={props.postDescription} />
      </Link>
      {props.profile === userId ? (
        <button onClick={handleDelete} startIcon={<DeleteIcon />}>
          Delete Button
        </button>
      ) : undefined}

      <CardMedia
        className={classes.media}
        // need to determine if the user has bought the image, and display the original or watermarked as needed
        //image={props.imageURLWatermarked}
        image={imageURL}
        title={props.imageTitle}
      />
      <CardActions disableSpacing>
        <IconButton
          className={clsx(classes.liked, {
            [classes.unliked]: !hasLiked,
          })}
          aria-label="add to favorites"
          onClick={handleLike}
        >
          <FavoriteIcon />
        </IconButton>
        <Typography paragraph style={{ marginTop: 17.5, marginLeft: 10 }}>
          {numberLikes}
        </Typography>
        <Typography paragraph style={{ marginTop: 17.5, marginLeft: 82.5 }}>
          {props.price}
          {props.priceCurrency}
        </Typography>

        {hasPurchased === true ? (
          <div>
            <Button
              className={classes.downloadButton}
              variant="contained"
              color="default"
              size="small"
              startIcon={<GetAppIcon />}
              onClick={handleDownload}
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
                <Button onClick={handleDownloadClose} color="primary">
                  Close
                </Button>
                {generateDownloadButton()}
              </DialogActions>
            </Dialog>
          </div>
        ) : (
          <div>
            <div className="purchaseImage">
              <Modal
                open={openPurchaseInstructions}
                onClose={handleClosePurchaseInstructions}
              >
                <div style={modalStyle} className={classes.paper}>
                  <h5>PURCHASE INSTRUCTIONS</h5>
                  <br />
                  1. Click YES to proceed with purchase or NO to return to photo
                  feed.
                  <br />
                  <br />
                  2. Once image purchased click DOWNLOAD to obtain unwatermarked
                  image.
                  <br />
                  <br />
                  <Button type="button" onClick={handleProceed}>
                    Proceed
                  </Button>
                  <Button
                    type="button"
                    onClick={handleClosePurchaseInstructions}
                  >
                    Close
                  </Button>
                </div>
              </Modal>
              <Button
                className={classes.buyButton}
                variant="contained"
                color="default"
                size="small"
                startIcon={<ShoppingCartIcon />}
                onClick={handleBuy}
              >
                BUY
              </Button>
            </div>

            <div className="purchaseImageProceed">
              {/* <div> */}
              <Modal open={openProceed} onClose={handleCloseProceed}>
                <div style={modalStyle} className={classes.paper}>
                  <h5>Are you sure you want to buy this?</h5>
                  <br />
                  <Button type="button" onClick={handleCloseProceed}>
                    NO
                  </Button>
                  <Button type="button" onClick={handleProceedCheck}>
                    YES
                  </Button>
                </div>
              </Modal>
            </div>
          </div>
        )}

        <div className="imageupload">
          <Modal open={open} onClose={handleClose}>
            <div style={modalStyle} className={classes.paper}>
              <h5>Which collections do you want to bookmark this photo in?</h5>
              {collections.map(({ id, post }) => (
                //  // console.log(id);
                //  // console.log(post);
                <Button
                  type="button"
                  onClick={() => handleAddToCollection(id)}
                  style={{ textTransform: "none" }}
                >
                  {id}
                </Button>
              ))}

              <input
                type="text"
                onChange={(e) => setNewCollection(e.target.value)}
                placeholder={"Add a new Collection!"}
                onKeyDown={addCollection}
              />
              <br />
              <Button type="button" onClick={handleClose}>
                Close
              </Button>
            </div>
          </Modal>
          <IconButton
            className={clsx(classes.bookmarked, {
              [classes.unbookmarked]: !bookmarked,
            })}
            onClick={handleClick}
            aria-label="bookmark"
            style={{ marginLeft: "auto", marginRight: -175 }}
          >
            <BookmarksIcon />
          </IconButton>
          <progress
            value={progress}
            max="100"
            className={`progress ${progress && "show"}`}
          />
        </div>
      </CardActions>
      <div style={{ display: "flex", marginLeft: 8, alignItems: "baseline" }}>
        <Typography paragraph style={{ marginLeft: 12.5, marginRight: 95 }}>
          Tags:{" "}
        </Typography>
        {props.tags.map((tag, index) => (
          <Chip
            label={"#" + tag}
            key={index}
            clickable
            onClick={handleChipClick}
            style={{ marginRight: 20 }}
          />
        ))}
      </div>
      <CardContent>
        {comments.slice(0, 1).map((comment) => (
          <div
            key={comment.id}
            style={{
              display: "flex",
              border: "1px solid black",
              paddingTop: 15,
              paddingLeft: 15,
              marginTop: 10,
              borderRadius: "7.5px",
            }}
          >
            <Link to={`/profile/${comment.user}`}>
              <Typography paragraph style={{ fontWeight: "bold" }}>
                {comment.user}
              </Typography>
            </Link>
            <Typography paragraph style={{ marginLeft: 50, textAlign: "left" }}>
              {comment.comment}
            </Typography>
            <Typography
              paragraph
              style={{ marginLeft: "auto", paddingRight: 15 }}
            >
              {typeof comment.timeStamp == "string"
                ? comment.timeStamp
                : comment.timeStamp !== null
                ? calculateDate(comment.timeStamp.toDate())
                : ""}
            </Typography>
          </div>
        ))}
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent style={{ marginTop: -20 }}>
          {comments.slice(1).map((comment) => (
            <div
              style={{
                display: "flex",
                border: "1px solid black",
                paddingTop: 15,
                paddingLeft: 15,
                marginBottom: 10,
                borderRadius: "7.5px",
              }}
              key={comment.id}
            >
              <Link to={`/profile/${comment.user}`}>
                <Typography paragraph style={{ fontWeight: "bold" }}>
                  {comment.user}
                </Typography>
              </Link>
              <Typography
                paragraph
                style={{ marginLeft: 50, textAlign: "left" }}
              >
                {comment.comment}
              </Typography>
              <Typography
                paragraph
                style={{ marginLeft: "auto", paddingRight: 15 }}
              >
                {typeof comment.timeStamp == "string"
                  ? comment.timeStamp
                  : comment.timeStamp !== null
                  ? calculateDate(comment.timeStamp.toDate())
                  : ""}
              </Typography>
            </div>
          ))}
        </CardContent>
      </Collapse>
      <form onSubmit={handlePostComment}>
        <FormControl
          fullWidth
          className={classes.margin}
          variant="outlined"
          style={{ paddingLeft: 15 }}
        >
          <InputLabel
            htmlFor="outlined-adornment-amount"
            style={{ paddingLeft: 15 }}
          >
            Add a comment...
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            labelWidth={60}
            style={{
              borderRadius: "7.5px",
              backgroundColor: "#e0e0e0",
              marginRight: 30.5,
            }}
            onChange={(e) => setComment(e.target.value)}
            value={comment}
          />
          <Button
            type="submit"
            disabled={!comment}
            style={{ display: "none" }}
          />
          <CardActions disableSpacing>
            <Button
              className={clsx(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              style={{
                textTransform: "none",
                paddingBottom: 1,
                marginRight: 22,
              }}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              {/* <ExpandMoreIcon /> */}
              <Typography paragraph>{viewCommentText}</Typography>
            </Button>
          </CardActions>
        </FormControl>
      </form>
    </Card>
  );
}
