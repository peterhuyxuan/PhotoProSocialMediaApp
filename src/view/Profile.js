import React from "react";
import { db } from "../backend/Firebase";
import { Post } from "../components/post/Post";
import useAppUser from "../hooks/useAppUser";
import { PhotoUpload } from "../components/PhotoUpload";
import NavigationBar from "../components/NavigationBar";
import "./Profile.css";

export function Profile(props) {
  const { user } = props;
  const [email, setEmail] = React.useState("");
  const [posts, setPosts] = React.useState(new Map());
  const { id: userId, bookmarks } = useAppUser();

  // const [tagsFollowed] = React.useState([]);

  db.collection("users")
    .doc(props.match.params.userId)
    .get()
    .then(function (doc) {
      setEmail(doc.data().email);
    });

  React.useEffect(() => {
    // get all the posts by this particular user
    const postdb = db
      .collection("posts")
      .where("profile", "==", props.match.params.userId)
      .orderBy("timeStamp", "desc");

    const unsubscribe = postdb.onSnapshot((snapshot) => {
      setPosts((a) => {
        a.set(
          "all",
          snapshot.docs.map((doc) => Object.assign({ id: doc.id }, doc.data()))
        );
        return new Map(a.entries());
      });
    });
    return () => {
      unsubscribe();
    };
  }, [props.match.params.userId]);
  // }, [tagsFollowed]);

  const allPosts = posts.get("all") || [];

  const _posts = React.useMemo(
    () =>
      allPosts.map((post) =>
        Object.assign({}, post, {
          bookmarked: bookmarks.includes(post.id),
        })
      ),
    [allPosts, bookmarks]
  );

  React.useEffect(() => {
    let userLikes = {};
    _posts.map((post) => {
      if (userLikes[post.profile] === undefined) {
        userLikes[post.profile] = 0;
      }
      userLikes[post.profile] += post.numberOfLikes;
      return null;
    });
    for (const user in userLikes) {
      db.collection("users").doc(user).update({
        totalNumberOfLikes: userLikes[user],
      });
    }
  }, [_posts]);

  return (
    <>
      <NavigationBar user={user} />
      <div className="Container">
        <div className="header">
        <h1>{props.match.params.userId}</h1>
        <h3>{email}</h3>
        </div>
        {
          // if the profile being viewed is the current user,
          // show the upload button, otherwise, don't show it
          props.match.params.userId === userId ? (
            <PhotoUpload profile={userId} />
          ) : undefined
        }

        {_posts.map((post) => (
          <Post key={post.id} {...post} />
        ))}
      </div>
    </>
  );
}
