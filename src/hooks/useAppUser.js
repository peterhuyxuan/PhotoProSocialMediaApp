import React from "react";
import { db } from "../backend/Firebase";

const context = React.createContext(undefined);

// Using Content to keep user data consistent as well as bookmark data
export function AppUserProvider(props) {
  const { username } = props;
  const USER_ID = username || "longLiveTheCompClubArmy671";
  const [currentUserId, setCurrentUserId] = React.useState(USER_ID);
  const [currentUser, setCurrentUser] = React.useState();

  // Getting the current user
  React.useEffect(() => {
    setCurrentUserId(USER_ID);
    const unsubscribe = db
      .collection("users")
      .doc(currentUserId)
      .onSnapshot((snapshot) => {
        const user = snapshot.exists
          ? Object.assign(
              {
                id: currentUserId,
              },
              snapshot.data()
            )
          : undefined;
        setCurrentUser(user);
      });

    return () => {
      unsubscribe();
    };
  }, [currentUserId, USER_ID]);

  const [collections, setCollections] = React.useState([]);

  // Setting all the collections that each user have
  React.useEffect(() => {
    setCurrentUserId(USER_ID);
    const collectionRef = db
      .collection("users")
      .doc(currentUserId)
      .collection("photoCollections");

    const rootUnsub = collectionRef.onSnapshot((snapshot) => {
      const collections = snapshot.docs.map((doc) =>
        Object.assign(
          {
            id: doc.id,
          },
          doc.data()
        )
      );

      setCollections(collections);
    });

    return () => {
      rootUnsub();
    };
  }, [currentUserId, USER_ID]);

  // Returning post id of all of the bookmarks
  const bookmarks = React.useMemo(() => {
    const postIds = new Set();
    collections.forEach(({ posts }) => posts.forEach((id) => postIds.add(id)));
    return Array.from(postIds.values());
  }, [collections]);

  // Setting the context values based on the current user, collections and bookmarks
  const contextValue = React.useMemo(
    () =>
      currentUser && {
        ...currentUser,
        collections,
        bookmarks,
      },
    [currentUser, collections, bookmarks]
  );

  // Allowing the context values to remain consistent in the children elements
  return (
    <context.Provider value={contextValue}>{props.children}</context.Provider>
  );
}

// Using content to keep user data consistent
export function useAppUser() {
  return React.useContext(context);
}

export default useAppUser;
