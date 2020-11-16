import React from "react";
import { db } from "../backend/Firebase";
import "./Account.css";
import NavigationBar from "../components/NavigationBar";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  // got from PhotoUpload (paper)
  paper: {
    position: "absolute",
    width: 350,
    height: 100,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #DDDFE2",
    outline: "none",
    boxShadow: theme.shadows[5],
    borderRadius: "5px",
  },
}));

export function Account(props) {
  const { user } = props;
  const [email, setEmail] = React.useState("");
  const [modalStyle] = React.useState(getModalStyle);
  const classes = useStyles();
  const [getOpen, setOpen] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [cardNo, setCardNo] = React.useState(""); // dodgey storage of card no....
  const [mmyy, setMmYy] = React.useState("");
  const [cvv, setCVV] = React.useState("");
  const [country, setCountry] = React.useState("");

  const update = (event) => {
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
      .doc(user)
      .get()
      .then(function (doc) {
        if (doc.exists) {
          db.collection("users").doc(user).update({
            // removes the hash on cloud firestore
            fullName: fullName,
            address: address,
            phone: phone,
            cardNo: cardNo,
            mmyy: mmyy,
            cvv: cvv,
            country: country,
          });
        }
      });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  React.useEffect(() => {
    db.collection("users")
      .doc(user)
      .get()
      .then(function (doc) {
        // console.log(doc.data());
        setEmail(doc.data().email);
        setFullName(doc.data().fullName);
        setAddress(doc.data().address);
        setPhone(doc.data().phone);
        setCardNo(doc.data().cardNo);
        setMmYy(doc.data().mmyy);
        setCVV(doc.data().cvv);
        setCountry(doc.data().country);
      });
  }, [user]);
  return (
    <>
      <NavigationBar user={user} />
      <div className="account">
        <Modal open={getOpen} onClose={handleClose}>
          <div style={modalStyle} className={classes.paper}>
            <IconButton className="closeButton" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
            <p className="accountConfirmation">Information Updated!</p>
          </div>
        </Modal>
        <div className="titleContainer">
          <p>{user}</p>
          <p>{email}</p>
        </div>

        <p className="updateHeading">Update your following info</p>
        <form>
          <input
            type="name"
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            value={fullName}
          />
          <br />
          <input
            type="address"
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            value={address}
          />
          <br />
          <input
            type="tel"
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            value={phone}
          />
          <br />
        </form>
        <form>
          <p className="updateHeading">Update Billing Details</p>

          <input
            type="tel"
            onChange={(e) => setCardNo(e.target.value)}
            placeholder="Card Number"
            value={cardNo}
          />
          <br />
          <input
            type="tel"
            onChange={(e) => setMmYy(e.target.value)}
            placeholder="MM/YY"
            value={mmyy}
          />
          <br />
          <input
            type="tel"
            onChange={(e) => setCVV(e.target.value)}
            placeholder="CVV"
            value={cvv}
          />
          <br />
          <input
            type="country"
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country"
            value={country}
          />
          <br />
        </form>
        <form>
          <button className="submitButton" type="submit" onClick={update}>
            Update Information
          </button>
        </form>
      </div>
    </>
  );
}
