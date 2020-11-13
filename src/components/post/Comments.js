import React from "react";
import Button from "@material-ui/core/Button";
import clsx from "clsx";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Collapse from "@material-ui/core/Collapse";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { db } from "../../backend/Firebase";
import firebase from "firebase";
import useAppUser from "../../hooks/useAppUser";

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
}));

export default function Comments(props) {
  const { id: userId } = useAppUser() || {};
  const { id: postId } = props;
  const classes = useStyles();
  const [comment, setComment] = React.useState("");
  const [comments, setComments] = React.useState([]);
  const [expanded, setExpanded] = React.useState(false);
  const [viewCommentText, setViewCommentText] = React.useState(
    "View all comments..."
  );

  React.useEffect(() => {
    let unsubscribeComment;
    if (postId) {
      unsubscribeComment = db
        .collection("posts")
        .doc(postId)
        .collection("comments")
        .orderBy("timeStamp", "desc")
        .onSnapshot((snapshot) => {
          setComments(snapshot.docs.map((doc) => doc.data()));
        });
    }
    return () => {
      unsubscribeComment();
    };
  }, [postId, comments]);

  const handleChangeText = (text) => setViewCommentText(text);

  const handleExpandClick = () => {
    if (expanded) {
      handleChangeText("View all comments...");
    } else {
      handleChangeText("Minimise comments...");
    }
    setExpanded(!expanded);
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
    <>
      {" "}
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
              {comments.length > 1 ? (
                <Typography paragraph>{viewCommentText}</Typography>
              ) : undefined}
            </Button>
          </CardActions>
        </FormControl>
      </form>
    </>
  );
}
