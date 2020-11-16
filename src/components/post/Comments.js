import React from "react";
import Button from "@material-ui/core/Button";
import clsx from "clsx";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Collapse from "@material-ui/core/Collapse";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { db } from "../../backend/Firebase";
import firebase from "firebase";
import useAppUser from "../../hooks/useAppUser";
import "./Post.css";
import { calculateDate } from "./Post";
import DeleteComment from "./DeleteComment";

// Styles for this component
const useStyles = makeStyles((theme) => ({
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
  form: {
    "& > *": {
      margin: theme.spacing(1),
      width: "25ch",
    },
  },
  commentScroll: {
    overflow: "scroll",
    height: "200px",
  },
}));

// Rendering comments
export default function Comments(props) {
  const { id: userId } = useAppUser() || {};
  const { id: postId, profile, data } = props;
  const classes = useStyles();
  const [comment, setComment] = React.useState("");
  const [comments, setComments] = React.useState([]);
  const [expanded, setExpanded] = React.useState(false);
  const [viewCommentText, setViewCommentText] = React.useState(
    "View all comments..."
  );

  // Collecting all comments from Firebase
  React.useEffect(() => {
    let unsubscribeComment;
    if (postId) {
      unsubscribeComment = db
        .collection("posts")
        .doc(postId)
        .collection("comments")
        .orderBy("timeStamp", "desc")
        .onSnapshot((snapshot) => {
          setComments(
            snapshot.docs.map((doc) =>
              Object.assign({ id: doc.id }, doc.data())
            )
          );
        });
    }
    return () => {
      unsubscribeComment();
    };
  }, [postId, comments]);

  // Assigns text to minimise or view all comments
  const handleChangeText = (text) => setViewCommentText(text);

  // Determine button to view all comments or minmise comments
  const handleExpandClick = () => {
    if (expanded) {
      handleChangeText("View all comments...");
    } else {
      handleChangeText("Minimise comments...");
    }
    setExpanded(!expanded);
  };

  // Logic to post comments into Firebase and rendering it
  const handlePostComment = (event) => {
    event.preventDefault();
    (async () => {
      await db.collection("posts").doc(postId).collection("comments").add({
        comment: comment,
        user: userId,
        timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setComment("");
    })();
  };

  // Rendering all of the comments if it's on the feed or search results feed
  return (
    <>
      {" "}
      {data === "searchFeedPost" ? (
        <CardContent
          className={clsx({ [classes.commentScroll]: comments.length > 1 })}
          style={{
            paddingTop: "0px",
            paddingBottom: "0px",
          }}
        >
          {comments.map((comment) => (
            <div className="mainCommentDiv" key={comment.id}>
              <div className="commentDiv1">
                <div className="commentuserDiv">
                  <Link to={`/profile/${comment.user}`}>
                    <Typography paragraph style={{ fontWeight: "bold" }}>
                      {comment.user}
                    </Typography>
                  </Link>
                </div>
                <div className="commentdateDiv">
                  <Typography
                    paragraph
                    style={{ marginLeft: "auto", paddingRight: 15 }}
                  >
                    {comment.timeStamp !== null ? (
                      calculateDate(comment.timeStamp.toDate())
                    ) : (
                      <CircularProgress color="inherit" size={20} />
                    )}
                  </Typography>
                </div>
              </div>
              <div className="commentDiv2">
                <div className="commentDivText">
                  <Typography paragraph>{comment.comment}</Typography>
                </div>
                <div className="commentDivDelete">
                  <DeleteComment
                    commentId={comment.id}
                    profile={profile}
                    commentUser={comment.user}
                    postId={postId}
                    currentUser={userId}
                  ></DeleteComment>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      ) : (
        <CardContent
          style={{
            paddingTop: "0px",
            paddingBottom: "0px",
          }}
        >
          {/* Viewing only the first comments that is unexpanded */}
          {comments.slice(0, 1).map((comment) => (
            <div key={comment.id} className="mainPostCommentDiv">
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
                {comment.timeStamp !== null ? (
                  calculateDate(comment.timeStamp.toDate())
                ) : (
                  <CircularProgress color="inherit" size={20} />
                )}
              </Typography>
              <DeleteComment
                commentId={comment.id}
                profile={profile}
                commentUser={comment.user}
                postId={postId}
                currentUser={userId}
              >
                style=
                {{
                  flex: 1,
                }}
              </DeleteComment>
            </div>
          ))}
        </CardContent>
      )}
      {/* Viewing all of the remaining comments that are expanded */}
      {data === "fromPost" ? (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent
            style={{
              paddingTop: "0px",
              paddingBottom: "0px",
            }}
          >
            {comments.slice(1).map((comment) => (
              <div
                style={{
                  display: "flex",
                  border: "1px solid black",
                  paddingTop: 15,
                  paddingLeft: 15,
                  marginTop: 8,
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
                  {comment.timeStamp !== null ? (
                    calculateDate(comment.timeStamp.toDate())
                  ) : (
                    <CircularProgress color="inherit" size={20} />
                  )}
                </Typography>
                <DeleteComment
                  commentId={comment.id}
                  profile={profile}
                  commentUser={comment.user}
                  postId={postId}
                  currentUser={userId}
                >
                  style=
                  {{
                    flex: 1,
                  }}
                </DeleteComment>
              </div>
            ))}
          </CardContent>
        </Collapse>
      ) : undefined}
      {/* Text box to enter your comment */}
      <form onSubmit={handlePostComment}>
        <FormControl
          fullWidth
          className={classes.margin}
          variant="outlined"
          style={{ paddingLeft: 15, paddingTop: 10, paddingBottom: 10 }}
        >
          <InputLabel
            htmlFor="outlined-adornment-amount"
            style={{ paddingTop: 10, paddingLeft: 15 }}
          >
            Add a comment...
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            labelWidth={120}
            style={{
              borderRadius: "7.5px",
              backgroundColor: "#e0e0e0",
              marginRight: 16,
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
                outline: "none",
              }}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              {/* <ExpandMoreIcon /> */}
              {comments.length > 1 && data !== "searchFeedPost" ? (
                <Typography paragraph>{viewCommentText}</Typography>
              ) : undefined}
            </Button>
          </CardActions>
        </FormControl>
      </form>
    </>
  );
}
