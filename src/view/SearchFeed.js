import firebase from "firebase";
import { db } from "../backend/Firebase";
import { Post } from "../components/post/SearchFeedPost";
import { makeStyles } from "@material-ui/core/styles";
import { getKeywords } from "../backend/keywords";
import React from "react";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";
import useAppUser from "../hooks/useAppUser";
import NavigationBar from "../components/NavigationBar";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";

// Style of the SearchFeed
const useStyles = makeStyles((theme) => ({
  // --------------
  buttonGroup: {
    padding: "20px",
    width: "75%",
    margin: "auto",
    "justify-content": "center",
    display: "flex",
    "flex-direction:": "row",
  },
  button: {
    flex: "1",
    "font-style": "italic",
    "font-weight": "bold",
  },
  gridList: {
    display: "flex",
    "justify-content": "center",
    "flex-direction:": "row",
    "backgroundColor:": "pink",
  },
  title: {
    "padding-top": "20px",
    "font-weight": "bold",
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

// Function for the SearchFeed page
export function SearchFeed(props) {
  const {
    user,
    searchType: searchTypeProp,
    searchText: searchTextProp,
  } = props;
  const [posts, setPosts] = React.useState([]);
  const [searchType, setSearchType] = React.useState(searchTypeProp);
  const [searchText, setSearchText] = React.useState(searchTextProp);
  const { bookmarks } = useAppUser();
  const classes = useStyles();

  const handleSearchType = (event, newSearchType) => {
    // Allows for switching between tags, users and descriptions by appending hashtag when tag is selected
    // and removing the hashtag when it's not selected.
    if (newSearchType === "tag" && !searchText.startsWith("#")) {
      setSearchText("#" + searchText);
    } else if (newSearchType !== "tag" && searchText.startsWith("#")) {
      setSearchText(searchText.substring(1));
    }
    setSearchType(newSearchType);
    console.log(searchText);
  };

  var postsdb = db.collection("posts");

  // Returnin the results of user when searching for the tag
  React.useEffect(() => {
    if (searchType === "tag") {
      var query = postsdb
        .where("tags", "array-contains", searchText.substring(1))
        .orderBy("timeStamp", "desc");
    } else if (searchType === "user") {
      query = postsdb
        .orderBy("profile_insensitive")
        .startAt(searchText.toLowerCase())
        .endAt(searchText.toLowerCase() + "\uf8ff");
    } else {
      // Default to searching by description if searchType isn't for users or tags.
      const keywords = getKeywords(searchText.toLowerCase());
      if (keywords.length === 0) {
        return;
      }
      query = postsdb
        // Firebase only allows contains any searches with arrays up to size 10.
        .where("keywords", "array-contains-any", keywords.slice(0, 10))
        .orderBy("timeStamp", "desc");
    }
    // Query for the tags
    query.onSnapshot((snapshot) => {
      setPosts(
        snapshot.docs.map((doc) => Object.assign({ id: doc.id }, doc.data()))
      );
      // Display feed posts from followed tags
      if (posts.length > 0 && searchType === "tag") {
        db.collection("users")
          .doc(user)
          .collection("tagsFollowed")
          .doc(searchText.substring(1))
          .set({
            tagLower: searchText.substring(1),
            timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
          });
      }
    });
  }, [searchType, postsdb, user, posts.length, searchText]);

  // Declaring the respective list of posts with the bookmark field
  const _posts = React.useMemo(
    () =>
      posts.map((post) =>
        Object.assign({}, post, {
          bookmarked: bookmarks.includes(post.id),
        })
      ),
    [posts, bookmarks]
  );

  // Rendering the search feed
  return (
    <>
      <NavigationBar user={user} />
      <h1 className={classes.title}>{searchText} </h1>
      <ToggleButtonGroup
        value={searchType}
        exclusive
        onChange={handleSearchType}
        aria-label="User or Tag Search"
        className={classes.buttonGroup}
      >
        {/* Toggle between search categories */}
        <ToggleButton value="tag" aria-label="tag" className={classes.button}>
          Tag
        </ToggleButton>
        <ToggleButton
          value="user"
          aria-label="users"
          className={classes.button}
        >
          Users
        </ToggleButton>
        <ToggleButton
          value="description"
          aria-label="description"
          className={classes.button}
        >
          Description
        </ToggleButton>
      </ToggleButtonGroup>
      {/* Rending the all the posts in a grid format */}
      <GridList cellHeight={800} cols={3} className={classes.gridList}>
        {_posts.map((post) => (
          <GridListTile key={post.id} cols={1}>
            <Post key={post.id} {...post} />
          </GridListTile>
        ))}
      </GridList>
    </>
  );
}
