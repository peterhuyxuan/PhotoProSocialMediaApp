import React, { useState } from "react";
import "./Collection.css";
import { db } from "../backend/Firebase";
// import Button from "@material-ui/core/Button";
import useAppUser from "../hooks/useAppUser";
import { useHistory } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";

export function Collection(props) {
  const { user } = props;
  const { id: userId, collections = [] } = useAppUser() || {};
  const history = useHistory("");
  const [newCollection, setNewCollection] = useState("");
  const handleClick = (id) => {
    history.push(`/collections/${id}`);
  };

  const addCollection = (e) => {
    if (e.key === "Enter") {
      // console.log("userId is " + userId);
      // console.log("new collection is " + newCollection);
      db.collection("users")
        .doc(userId)
        .collection("photoCollections")
        .doc(newCollection)
        .set({
          posts: [],
        });
    }
  };

  return (
    <>
      <NavigationBar user={user} />
      <div className="mainContainer">
        <div className="headingContainer">
        <p className="heading">My Collections</p>
        </div>

        <div className="container">
          {collections.map(({ id }) => (
            <button
              className="collectionButton"
              // type="button"
              // style={{ textTransform: "none" }}
              onClick={() => handleClick(id)}
            >
              <p >{id}</p>
            </button>
          ))}
        <input
            className="collectionInput"
            type="text"
            onChange={(e) => setNewCollection(e.target.value)}
            placeholder={"Add a new Collection!"}
            onKeyDown={addCollection}
          />
        </div> 
      </div>
    </>
  );
}
