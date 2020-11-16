import React, { useState } from "react";
import "./Collection.css";
import { db } from "../backend/Firebase";
import useAppUser from "../hooks/useAppUser";
import { useHistory } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";

// displays the collections a user has
export function Collection(props) {

  const { user } = props;
  // obtaining userId and the collection list from useAppUser file
  const { id: userId, collections = [] } = useAppUser() || {};
  const history = useHistory("");
  // storing name of the new collection
  const [newCollection, setNewCollection] = useState("");
  // links to the collectionPost page
  const handleClick = (id) => {
    history.push(`/collections/${id}`);
  };

  // to add a new collection
  const addCollection = (e) => {
    // if the user presses Enter key and length of collection is greater than 0, add to firebase
    if (e.key === "Enter" && newCollection.trim().length > 0) {
      db.collection("users")
        .doc(userId)
        .collection("photoCollections")
        .doc(newCollection.trim())
        .set({
          posts: [],
        });
      setNewCollection("");
    }
  };

  return (
    <>
      <NavigationBar user={user} />

      <div className="mainContainer">
        <div className="headingContainer">
          <p className="heading">My Collections</p>
        </div>

        {/*Div to display the collections*/}
        <div className="container">
          {collections.map(({ id }) => (
            <button
              className="collectionButton"
              onClick={() => handleClick(id)}
            >
              <p>{id}</p>
            </button>
          ))}

          {/*Input for adding a new collection*/}
          <input
            className="collectionInput"
            type="text"
            onChange={(e) => setNewCollection(e.target.value)}
            placeholder={"Add a new Collection!"}
            onKeyDown={addCollection}
            value={newCollection}
          />
        </div>
      </div>
    </>
  );
}
