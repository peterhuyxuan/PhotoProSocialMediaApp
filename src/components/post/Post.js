import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import CardHeader from "../CardHeader";
import { db } from "../../backend/Firebase";
import { format } from "date-fns";
import "./Post.css";
import useAppUser from "../../hooks/useAppUser";
import Likes from "./Likes";
import Download from "./Download";
import Purchase from "./Purchase";
import Bookmark from "./Bookmark";
import Comments from "./Comments";
import TagChips from "./TagChips";
import Delete from "./Delete";

// Styles for the post component
const useStyles = makeStyles((theme) => ({
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
  downloadButton: {
    margin: theme.spacing(1),
    marginLeft: 20,
  },
}));

// Function to return the formatted time in string format
function getTime(date) {
  let dateString = (date.getMinutes() === 0
    ? format(date, "ha")
    : format(date, "h:mma")
  ).toLocaleLowerCase();
  return dateString;
}

// Checking if two dates are on the same day or not
function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Calculating the timestamp and returning the string format
export function calculateDate(date) {
  let diff = new Date(Date.now()).getTime() - date.getTime();
  let days = Math.ceil(diff / (1000 * 3600 * 24));
  let hours = Math.floor(diff / 1000 / 60 / 60);
  diff -= hours * 1000 * 60 * 60;
  let minutes = Math.floor(diff / 1000 / 60);

  let timeDifference = "";
  if (isSameDay(date, new Date(Date.now()))) {
    if (minutes < 1) {
      timeDifference = "now";
    } else if (hours < 1) {
      timeDifference = `${minutes} mins ago`;
    } else if (hours < 8) {
      timeDifference = `${hours} hours ago`;
    } else if (hours < 24) {
      timeDifference = `at ${getTime(date)}`;
    }
  } else if (days <= 5) {
    timeDifference = `${days} ${days === 1 ? "day" : "days"} ago`;
  } else {
    timeDifference = `on ${format(date, "EEE dd/MM/yyyy")}`;
  }

  return timeDifference;
}

// Function for the post component
export function Post(props) {
  const { id: userId } = useAppUser() || {};
  const {
    id: postId,
    bookmarked,
    imageURL: imageURLProp,
    imageURLWatermarked,
    profile,
    postDescription,
    imageTitle,
    tags,
    numberOfLikes,
    price,
    priceCurrency,
    timeStamp,
  } = props;
  const classes = useStyles();

  const [imageURL, setImageURL] = React.useState("");
  const [purchased, setPurchased] = React.useState([]);
  const [hasPurchased, setHasPurchased] = React.useState(false);

  // Getting from Firebase all the users that liked the post
  React.useEffect(() => {
    let unsubscribePurchased;
    if (postId) {
      unsubscribePurchased = db
        .collection("posts")
        .doc(postId)
        .collection("purchased")
        .onSnapshot((snapshot) => {
          setPurchased(snapshot.docs.map(({ id }) => id));
        });
    }
    return () => {
      unsubscribePurchased();
    };
  }, [postId]);

  // Checking if the current user have purchased the image of the post or not
  React.useEffect(() => {
    var docRef = db // quering
      .collection("posts")
      .doc(postId)
      .collection("purchased")
      .doc(userId); // checking if a certain user ID has a post purchased
    docRef.get().then(function (doc) {
      if (doc.exists) {
        // if they have bought the image
        setHasPurchased(true);
        // Ensuring the author of the image can see the unwatermarked photo
      } else if (profile === userId) {
        db.collection("posts")
          .doc(postId)
          .collection("purchased")
          .doc(userId)
          .set({});
        setHasPurchased(true);
      } else {
        setHasPurchased(false);
      }
    });
  }, [purchased, hasPurchased, postId, userId, profile]);

  // Determining and rendering the watermarked and unwatermarked images
  React.useEffect(() => {
    var docRef = db
      .collection("posts")
      .doc(postId)
      .collection("purchased")
      .doc(userId);

    docRef.get().then(function (doc) {
      if (doc.exists) {
        // then this person has bought this image, so show the original
        setImageURL(imageURLProp);
      } else {
        // they didn't buy it, so show watermarked version
        // set the watermarked image to be a constructed get request
        if (typeof imageURLWatermarked !== "undefined") {
          // then the image has a watermarked version stored in the database
          setImageURL(imageURLWatermarked);
        } else {
          // there is no version, so generate it
          var parsedURL = encodeURI(imageURLProp);
          var watermarkedAPIURLRequest =
            "https://textoverimage.moesif.com/image?image_url=" +
            parsedURL +
            "&text=SAMPLE&text_color=000000ff&text_size=64&x_align=center&y_align=middle";
          setImageURL(watermarkedAPIURLRequest);
        }
      }
    });
  }, [purchased, postId, userId, imageURLProp, imageURLWatermarked]);

  // Rendering the post
  return (
    <Card
      className={classes.root}
      variant="outlined"
      style={{ borderColor: "#cce6ff", borderWidth: 5, borderRadius: 20 }}
    >
      {/* Rendering the header and image */}
      <CardHeader
        title={profile}
        subheader={postDescription}
        postId={postId}
        timeStamp={timeStamp !== null ? calculateDate(timeStamp.toDate()) : ""}
      />
      <CardMedia
        className={classes.media}
        image={imageURL}
        title={imageTitle}
      />
      {/* Rendering all the elements of the posts */}
      <CardActions disableSpacing>
        <div className="div1">
          <div className="div2">
            <Likes tags={tags} id={postId} numberOfLikes={numberOfLikes} />
            <Typography
              paragraph
              style={{
                marginTop: 17.5,
                marginLeft: 82.5,
                textTransform: "uppercase",
              }}
            >
              {price}
              {priceCurrency}
            </Typography>

            <div style={{ marginTop: 4, marginLeft: 40 }}>
              {hasPurchased === true ? (
                <Download
                  hasPurchased={hasPurchased}
                  imageURL={imageURL}
                  data="fromPost"
                />
              ) : (
                <Purchase
                  tags={tags}
                  id={postId}
                  setHasPurchased={setHasPurchased}
                />
              )}
            </div>
          </div>
          <div className="div3">
            <Bookmark tags={tags} id={postId} bookmarked={bookmarked} />
            <Delete profile={profile} userId={userId} postId={postId} />
          </div>
        </div>
      </CardActions>
      {/* Rendering all of the tags in the posts and the comments */}
      <TagChips tags={tags} />
      <Comments id={postId} profile={profile} data="fromPost" />
    </Card>
  );
}
