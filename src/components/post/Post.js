import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import CardHeader from "../CardHeader";
import { db } from "../../backend/Firebase";
import { Link } from "react-router-dom";
import "./Post.css";
import useAppUser from "../../hooks/useAppUser";
import Likes from "./Likes";
import Download from "./Download";
import Purchase from "./Purchase";
import Bookmark from "./Bookmark";
import Comments from "./Comments";
import TagChips from "./TagChips";
import Delete from "./Delete";
import { BorderColor } from "@material-ui/icons";

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
    liked,
    numberOfLikes,
    price,
    priceCurrency,
  } = props;
  const classes = useStyles();

  const [imageURL, setImageURL] = React.useState("");
  const [purchased, setPurchased] = React.useState([]);
  const [hasPurchased, setHasPurchased] = React.useState(false);

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

  // TODO: Transfer all styles to CSS

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

  return (
    <Card className={classes.root} variant="outlined" style={{borderColor: '#cce6ff', borderWidth: 5, borderRadius: 20}}>
      <Link to={`/profile/${profile}`}>
        <CardHeader title={profile} subheader={postDescription} />
      </Link>

      <CardMedia
        className={classes.media}
        // need to determine if the user has bought the image, and display the original or watermarked as needed
        image={imageURL}
        title={imageTitle}
      />
      <CardActions disableSpacing>
        <div className="div1">
          <div className="div2">
            <Likes
              tags={tags}
              id={postId}
              liked={liked}
              numberOfLikes={numberOfLikes}
            />
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
                <Download hasPurchased={hasPurchased} imageURL={imageURL} />
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
      <TagChips tags={tags} />
      <Comments id={postId} />
    </Card>
  );
}
