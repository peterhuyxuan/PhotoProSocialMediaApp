import React, { useState } from "react";
import "./Register.css";
import { auth } from "../backend/Firebase.js";
import { useHistory } from "react-router-dom";
import { db } from "../backend/Firebase";

export function Register(props) {
  const history = useHistory("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [cardNo, setCardNo] = useState(""); // dodgey storage of card no....
  const [mmyy, setMmYy] = useState("");
  const [cvv, setCVV] = useState("");
  const [country, setCountry] = useState("");

  const register = (event) => {
    event.preventDefault();

    if (phone.toString().length !== 10) {
      alert("Your phone number starting with '04' must be 10 digits!");
      return;
    }

    if (cardNo.toString().length !== 16) {
      alert("Your credit card number must be 16 digits!");
      return;
    }

    if (mmyy.toString().length !== 4) {
      alert("Your expiry date must be entered as MMYY");
      return;
    }

    if (cvv.toString().length !== 3) {
      alert("Your CVV number must be 3 digits!");
      return;
    }

    db.collection("users")
      .doc(username)
      .get()
      .then(function (doc) {
        if (doc.exists) {
          alert("Username already exist. Please enter another username!");
          // console.log("Doc exist");
        } else {
          // console.log("Doc doesn't exist");
          // AUTHENTICATION PART
          auth
            .createUserWithEmailAndPassword(email, password)
            .then((auth) => {
              if (auth.user) {
                auth.user
                  .updateProfile({
                    username: username,
                  })
                  .then((s) => {
                    history.push("/");
                  });
                props.onChange(username);
              }
            })
            .catch((e) => {
              alert(e.message);
            });

          db.collection("users").doc(username).set({
            // removes the hash on cloud firestore
            username: username,
            email: email,
            fullName: fullName,
            address: address,
            phone: phone,
            cardNo: cardNo,
            mmyy: mmyy,
            cvv: cvv,
            country: country,
            username_insensitive: username.trim().toLowerCase(), // Zac adding this to make searching easier.
          });
        }
      });

    // TODO add current user to Firebase or call a function to change variables?
  };

  return (
    <div className="register">
      <div className="register_container">
        <h1>Create Account</h1>
        <form>
          <center>
            <input
              type="name"
              onChange={(e) => setUsername(e.target.value)}
              className="register_username"
              placeholder="Username"
            />
          </center>
          <center>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </center>
          <center>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </center>
          <center>
            <input
              type="name"
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
            />
          </center>
          <center>
            <input
              type="address"
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
            />
          </center>
          <center>
            <input
              type="number"
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
            />
          </center>
        </form>
        <form>
          <h3>Enter Billing Details</h3>
          <center>
            <input
              type="number"
              onChange={(e) => setCardNo(e.target.value)}
              placeholder="Card Number"
            />
          </center>
          <center>
            <input
              type="number"
              onChange={(e) => setMmYy(e.target.value)}
              placeholder="MM/YY"
            />
            <input
              type="number"
              onChange={(e) => setCVV(e.target.value)}
              placeholder="CVV"
            />
          </center>
          <center>
            <input
              type="country"
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country"
            />
          </center>
        </form>
        <form>
          <center>
            <button type="submit" onClick={register} className="create_account">
              Create Account
            </button>
          </center>
        </form>
      </div>
    </div>
  );
}

export default Register;
