import React from "react";
import { db } from "../backend/Firebase";

const context = React.createContext(undefined);

export function AppUserProvider(props) {
  const { username } = props;
  const USER_ID = username || "longLiveTheCompClubArmy671";
  const [currentUserId, setCurrentUserId] = React.useState(USER_ID);
  const [currentUser, setCurrentUser] = React.useState();

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

  const bookmarks = React.useMemo(() => {
    const postIds = new Set();
    collections.forEach(({ posts }) => posts.forEach((id) => postIds.add(id)));
    return Array.from(postIds.values());
  }, [collections]);

  const contextValue = React.useMemo(
    () =>
      currentUser && {
        ...currentUser,
        collections,
        bookmarks,
      },
    [currentUser, collections, bookmarks]
  );

  return (
    <context.Provider value={contextValue}>{props.children}</context.Provider>
  );
}

export function useAppUser() {
  return React.useContext(context);
}

export default useAppUser;
