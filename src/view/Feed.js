import React from "react";
import { db } from "../backend/Firebase";
import { PhotoUpload } from "../components/PhotoUpload";
import { PopularUsers } from "../components/PopularUsers";
import { Post } from "../components/post/Post";
import useAppUser from "../hooks/useAppUser";
import NavigationBar from "../components/NavigationBar";

export function Feed(props) {
  const { user } = props;
  const [posts, setPosts] = React.useState(new Map());
  const { bookmarks } = useAppUser();
  const [tagsFollowed, setTagsFollowed] = React.useState([]);

  // Getting the top 10 tags that the user followed
  React.useEffect(() => {
    const tags = db
      .collection("users")
      .doc(user)
      .collection("tagsFollowed")
      .orderBy("timeStamp", "desc");

    const unsubscribe = tags.onSnapshot((snapshot) => {
      setTagsFollowed(snapshot.docs.slice(0, 10).map(({ id }) => id));
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Getting all of the posts
  React.useEffect(() => {
    if (tagsFollowed === undefined) return;

    const postdb = db.collection("posts").orderBy("timeStamp", "desc");

    if (!tagsFollowed.length) {
      const unsubscribe = postdb.onSnapshot((snapshot) => {
        setPosts((a) => {
          a.set(
            "all",
            snapshot.docs.map((doc) =>
              Object.assign({ id: doc.id }, doc.data())
            )
          );
          return new Map(a.entries());
        });
      });
      return () => {
        unsubscribe();
      };
    }

    var postIdOfTags = [];

    // Setting posts with the tags that the user follow in a map with the tags kep
    const unsubscribeTagsPost = db
      .collection("posts")
      .where("tags", "array-contains-any", tagsFollowed)
      .orderBy("timeStamp", "desc")
      .onSnapshot((snapshot) => {
        postIdOfTags = snapshot.docs.map((doc) => doc.id);
        setPosts((a) => {
          a.set(
            "tags",
            snapshot.docs.map((doc) =>
              Object.assign({ id: doc.id }, doc.data())
            )
          );
          return new Map(a.entries());
        });
      });

    // Get all the remaining posts that the user doesn't follow in a map with the remainder key
    const unsubscribeRemainingPost = postdb.onSnapshot((snapshot) => {
      setPosts((a) => {
        a.set(
          "remainder",
          snapshot.docs
            .filter((doc) => {
              if (postIdOfTags.includes(doc.id)) {
                return false; // skip
              }
              return true;
            })
            .map((doc) => Object.assign({ id: doc.id }, doc.data()))
        );
        return new Map(a.entries());
      });
    });
    return () => {
      unsubscribeTagsPost();
      unsubscribeRemainingPost();
    };
  }, [tagsFollowed]);

  // Combining the posts of the tags the user follows with the rest
  const allPosts = posts.get("all") || [];
  const remainingPost = posts.get("remainder") || [];
  const tagPosts = posts.get("tags") || [];
  const combinedTagPosts = tagPosts.concat(remainingPost);

  const postsSet =
    (tagsFollowed === undefined
      ? []
      : tagsFollowed.length
      ? combinedTagPosts
      : allPosts) || [];

  // Setting all of the post with whether the user bookmarked the post or not as another field
  const _posts = React.useMemo(
    () =>
      postsSet.map((post) =>
        Object.assign({}, post, {
          bookmarked: bookmarks.includes(post.id),
        })
      ),
    [postsSet, bookmarks]
  );

  // Count all of the total number of likes that each user has
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

  // Rendering the Feed of posts with the navbar and photoupload component
  return (
    <>
      <NavigationBar user={user} />
      <PhotoUpload profile={user} />
      <PopularUsers />
      {_posts.map((post) => (
        <Post key={post.id} {...post} />
      ))}
    </>
  );
}
