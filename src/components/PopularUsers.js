import React from "react";
import { db } from "../backend/Firebase";
import { Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export function PopularUsers() {
  const [popularUsers, setPopularUsers] = React.useState([]);
  const [imageURLs, setImageURLs] = React.useState(new Map());

  React.useEffect(() => {
    let unsubscribePopularUsers = db
      .collection("users")
      .orderBy("totalNumberOfLikes", "desc")
      .onSnapshot((snapshot) => {
        setPopularUsers(
          snapshot.docs.slice(0, 3).map((doc) => ({
            user: doc.id,
            totalNumberOfLikes: doc.data().totalNumberOfLikes,
          }))
        );
      });
    return () => unsubscribePopularUsers();
  }, []);

  React.useEffect(() => {
    popularUsers.map((users) => {
      db.collection("posts")
        .where("profile", "==", users.user)
        .orderBy("numberOfLikes", "desc")
        .onSnapshot((snapshot) => {
          setImageURLs((a) => {
            a.set(
              users.user,
              snapshot.docs.slice(0, 1).map((doc) => doc.data().imageURL)
            );
            return new Map(a.entries());
          });
        });
    });
  }, [popularUsers]);

  const [index, setIndex] = React.useState(0);

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  return (
    <>
      <Carousel
        activeIndex={index}
        onSelect={handleSelect}
        style={{ width: "50%" }}
      >
        {popularUsers.map((users) => (
          <Carousel.Item >
            <img src={imageURLs.get(users.user)} style={{maxHeight: 500, borderRadius: 10}}/>
            <Carousel.Caption>
              <Link to={`/profile/${users.user}`} style={{ color: "white" }}>
                <h3>{users.user}</h3>
              </Link>
              <p>Currently have {users.totalNumberOfLikes} total likes</p>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </>
  );
}
