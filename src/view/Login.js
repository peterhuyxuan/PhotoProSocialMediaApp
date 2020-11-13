import React, { useState } from "react";
import "./Login.css";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { auth, db } from "../backend/Firebase.js";

export function Login(props) {
  const [email, setEmail] = useState("");
  const history = useHistory("");
  const [password, setPassword] = useState("");

  const login = (event) => {
    event.preventDefault(); // prevents website from reloading everything you submit

    auth
      .signInWithEmailAndPassword(email, password) // message to firebase
      .then((auth) => {
        // once you sign in, the auth variable stores info about the user
        // console.log(auth); // log the user info (only needed once registered)
        var query = db.collection("users").where("email", "==", email);
        query.get().then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            var username = doc.id;
            props.onChange(username);
          });
        });

        history.push("/");
      })
      .catch((e) => {
        alert(e.message); // alert the error message
      });
  };

  return (
    <div className="login">
      <div className="login_container">
        <h1>PhotoPro</h1>
        <form>
          <center>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              placeholder="Email Address"
            />
          </center>
          <center>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
            />
          </center>
          <center>
            <button type="submit" onClick={login} className="login_login">
              Log In
            </button>
          </center>
          <center>
            <p className="orHeading">OR</p>
          </center>
          <center>
            <Link to="/register">
              <button className="login_login">
                Create New Account
              </button>
            </Link>
          </center>
        </form>
      </div>
    </div>
  );
}

export default Login;

////////////// REFERENCE ////////////////
// https://www.youtube.com/watch?v=nJH0wUUg6EU&fbclid=IwAR2EjZNXUI4MI1Cd_y71x47rRrlnUmL01cPHj3mftPZ-fPfEr35RVWe1nQs&app=desktop&ab_channel=Decacode73
