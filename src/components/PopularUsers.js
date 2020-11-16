import React from "react";
import { db } from "../backend/Firebase";
import { Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Function for the popular user carousel
export function PopularUsers() {
  const [popularUsers, setPopularUsers] = React.useState([]);
  const [imageURLs, setImageURLs] = React.useState(new Map());

  // Getting the top three users with the most likes
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

  // Getting the most like picture of the most popular user
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
      return undefined;
    });
  }, [popularUsers]);

  const [index, setIndex] = React.useState(0);

  // Setting the index of the carousel selected
  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  // Rendering the carousel that displays the most popular users
  return (
    <>
      <Carousel
        activeIndex={index}
        onSelect={handleSelect}
        style={{ width: "50%" }}
      >
        {popularUsers.map((users, index) => (
          <Carousel.Item>
            <img
              alt={users.user}
              src={imageURLs.get(users.user)}
              style={{ maxHeight: 500, borderRadius: 10 }}
            />
            <Carousel.Caption>
              <h2 style={{ fontWeight: "bold" }}>
                Most Popular User #{index + 1}
              </h2>
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
