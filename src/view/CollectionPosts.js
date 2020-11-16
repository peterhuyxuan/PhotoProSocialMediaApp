import React from "react";
import "./CollectionPosts.css";
import useAppUser from "../hooks/useAppUser";
import { db } from "../backend/Firebase";
import { Post } from "../components/post/Post";
import NavigationBar from "../components/NavigationBar";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";

// styles for the modals 
const useStyles = makeStyles((theme) => ({
  smallPaper: {
    position: "absolute",
    width: 300,
    height: 150,
    backgroundColor: "#fafafa",
    border: "2px solid #DDDFE2",
    outline: "none",
    boxShadow: theme.shadows[5],
    borderRadius: "20px",
  },
}));

// position of modal in page 
function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

// File for displaying the posts of a collection 
export function CollectionPosts(props) {

  const { user } = props;
  const [modalStyle] = React.useState(getModalStyle);
  // set post list from firebase into setPostId 
  const [postId, setPostId] = React.useState([]);
  const [postData, setPostData] = React.useState([]);
  const { id: userId, bookmarks, collections } = useAppUser() || {};
  let pathname = props.location.pathname;
  const col = "/collections/";
  const [openConfirmation, setOpenConfirmation] = React.useState(false);

  const classes = useStyles();
  pathname = pathname.substring(col.length);

  // if route pathname = id of collection, set postId with post list 
  // rerender if collections, pathname change 
  React.useEffect(() => {
    collections.map(({ id, posts }) => {
      if (id === pathname) {
        setPostId(posts);
      }
      return null;
    });
  }, [collections, pathname]);

  // re-render posts if postId array changes, important for when user unbookmarks post 
  // want page to re-render immediately without refreshing page 
  React.useEffect(() => {
    setPostData([]);
    postId.map((post) => {
      db.collection("posts")
        .doc(post)
        .get()
        .then((doc) => {
          const postDataWithId = Object.assign({ id: doc.id }, doc.data());
          setPostData((prevItems) => [...prevItems, postDataWithId]);
        });
      return null;
    });
  }, [postId]);

  // adds bookmark as a field to array of posts object
  // also allows page to re-render whenever post is added to a collection
  const _posts = React.useMemo(
    () =>
      postData.map((post) =>
        Object.assign({}, post, {
          bookmarked: bookmarks.includes(post.id),
        })
      ),
    [postData, bookmarks]
  );

  // use async function to remove post from collection in firebase
  // redirects to collection page
  const removeCollection = async () => {
    await db
      .collection("users")
      .doc(userId)
      .collection("photoCollections")
      .doc(pathname)
      .delete();

    window.location = "/collection";
  };

  // when user clicks on delete button, modal for confirmation opens 
  const handleCollectionDeletion = () => {
    setOpenConfirmation(true);
  };

  // close modal 
  const handleCloseConfirmation = () => {
    setOpenConfirmation(false);
  };

  return (
    <>
      <NavigationBar user={user} />


      {/*Confirmation Modal for deletion */}
      <Modal open={openConfirmation} onClose={handleCloseConfirmation}>
        <div style={modalStyle} className={classes.smallPaper}>
          {/*Close Icon Button*/}
          <IconButton className="closeButton" onClick={handleCloseConfirmation}>
            <CloseIcon />
          </IconButton>
          <div className="collectionHeading">
            <p>Delete?</p>
          </div>
          {/*Yes button removes the collection*/}
          <Button onClick={removeCollection}>Yes</Button>
          <Button style={{ float: "right" }}>No</Button>
        </div>
      </Modal>

      {/*Button for delete*/}
      <button className="deleteContainer" onClick={handleCollectionDeletion}>
        Delete Collection
      </button>

      {/*Collection heading and the posts*/}
      <div className="headingContainer">
        <span className="heading">Collection: {pathname}</span>
      </div>

      {/*If post length is greater than 0, display posts, else state there is no posts in collection*/}
      {_posts.length > 0 ? (
        <div className="Container">
          {_posts.map((post) => (
            <Post key={post.id} {...post} />
          ))}
        </div>
      ) : (
        <div className="Container">
          <p>No posts added to {pathname} yet!</p>
        </div>
      )}
    </>
  );
}
