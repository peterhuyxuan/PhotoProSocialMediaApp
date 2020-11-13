import React from "react";
import "./CollectionPosts.css";
import useAppUser from "../hooks/useAppUser";
import { db } from "../backend/Firebase";
import { Post } from "../components/post/Post";
import NavigationBar from "../components/NavigationBar";

export function CollectionPosts(props) {
  const { user } = props;
  const [postId, setPostId] = React.useState([]);
  const [postData, setPostData] = React.useState([]);
  const { bookmarks, collections } = useAppUser() || {};
  let pathname = props.location.pathname;
  const col = "/collections/";

  pathname = pathname.substring(col.length);

  React.useEffect(() => {
    collections.map(({ id, posts }) => {
      if (id === pathname) {
        setPostId(posts);
      }
      return null;
    });
  }, [collections, pathname]);

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

  const _posts = React.useMemo(
    () =>
      postData.map((post) =>
        Object.assign({}, post, {
          bookmarked: bookmarks.includes(post.id),
        })
      ),
    [postData, bookmarks]
  );

  return (
    <>
      <NavigationBar user={user} />
      <div className="headingContainer">
        <span className="heading">My Collections</span>
      </div>
      <div className="Container">
        {_posts.map((post) => (
          <Post key={post.id} {...post} />
        ))}
      </div>
    </>
  );
}
