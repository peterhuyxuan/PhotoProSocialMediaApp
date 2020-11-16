import React from "react";
import Button from "@material-ui/core/Button";
import Modal from "@material-ui/core/Modal";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import { makeStyles } from "@material-ui/core/styles";
import { db } from "../../backend/Firebase";
import firebase from "firebase";
import useAppUser from "../../hooks/useAppUser";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";

// Modal style
function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

// Styles for the purchase button and modal
const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 400,
    height: 343,
    backgroundColor: "#fafafa",
    border: "2px solid #DDDFE2",
    outline: "none",
    boxShadow: theme.shadows[5],
    borderRadius: "20px",
  },
  buyButton: {
    margin: theme.spacing(1),
  },
  smallPaper: {
    position: "absolute",
    width: 300,
    height: 150,
    backgroundColor: "#fafafa",
    border: "2px solid #DDDFE2",
    outline: "none",
    boxShadow: theme.shadows[5],
    borderRadius: "20px",
  },
}));

// Function for the Purchase component
export default function Purchase(props) {
  const classes = useStyles();
  const { id: userId } = useAppUser() || {};

  const { id: postId, tags } = props;
  const [modalStyle] = React.useState(getModalStyle);
  const [
    openPurchaseInstructions,
    setOpenPurchaseInstructions,
  ] = React.useState(false);
  const [openProceed, setOpenProceed] = React.useState(false);

  // Open the first purchase modal
  const handleBuy = () => {
    setOpenPurchaseInstructions(true);
  };

  // Close the first purchase modal
  const handleClosePurchaseInstructions = () => {
    setOpenPurchaseInstructions(false);
  };

  // Open the second purchase modal
  const handleProceed = () => {
    setOpenPurchaseInstructions(false);
    setOpenProceed(true);
  };

  // Logic to confirm the purchase of the image
  const handleProceedCheck = async () => {
    var cardNo;
    await db
      .collection("users")
      .doc(userId)
      .get()
      .then((doc) => {
        cardNo = doc.data().cardNo;
      });

    if (cardNo.toString().length === 16) {
      await db
        .collection("posts")
        .doc(postId)
        .collection("purchased")
        .doc(userId)
        .set({});
      await addTag();
      await props.setHasPurchased(true);
      setOpenProceed(false);
      alert("Purchase successful!");
    } else {
      setOpenProceed(false);
      alert(
        "Your credit card details are invalid. Please check the card details in your profile"
      );
    }
  };

  // Close the second purchase modal
  const handleCloseProceed = () => {
    setOpenProceed(false);
  };

  // Adding tha tags that the user will follow after purchasing the image
  function addTag() {
    tags.forEach((tag, index) => {
      db.collection("users")
        .doc(userId)
        .collection("tagsFollowed")
        .doc(tag)
        .set({
          tagLower: tag,
          timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          // console.log(`Added tag: ${tag}`);
        })
        .catch(() => {
          console.error(`Error writing tag: ${tag}`);
        });
    });
  }

  // Rendering the purchase image button and different modal
  return (
    <div>
      <div className="purchaseImage">
        <Modal
          open={openPurchaseInstructions}
          onClose={handleClosePurchaseInstructions}
        >
          <div style={modalStyle} className={classes.paper}>
            <IconButton
              className="closeButton"
              onClick={handleClosePurchaseInstructions}
            >
              <CloseIcon />
            </IconButton>
            <div className="collectionHeading">
              <h5>PURCHASE INSTRUCTIONS</h5>
            </div>
            <div className="collectionButtonDivs">
              <span>
                1. Click PROCEED to proceed with purchase or CLOSE to return to
                photo feed.
              </span>
              <br />
              <br />
              <span>
                2. Once image purchased click DOWNLOAD to obtain unwatermarked
                image.
              </span>
              <br />
              <br />
              <Button
                type="button"
                onClick={handleProceed}
                style={{ outline: "none" }}
              >
                Proceed
              </Button>
              <Button
                type="button"
                onClick={handleClosePurchaseInstructions}
                style={{ outline: "none" }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
        <Button
          className={classes.buyButton}
          variant="contained"
          color="default"
          size="small"
          startIcon={<ShoppingCartIcon />}
          onClick={handleBuy}
          style={{ outline: "none" }}
        >
          BUY
        </Button>
      </div>

      <div className="purchaseImageProceed">
        <Modal open={openProceed} onClose={handleCloseProceed}>
          <div style={modalStyle} className={classes.smallPaper}>
            <IconButton className="closeButton" onClick={handleCloseProceed}>
              <CloseIcon />
            </IconButton>
            <div className="purchaseHeading">
              <h5>Proceed with Purchase?</h5>
            </div>
            <div className="purchaseButtons">
              <div className="YesNo">
                <button className="deletebutton" onClick={handleCloseProceed}>
                  NO
                </button>
              </div>
              <div className="YesNo">
                <button className="deletebutton" onClick={handleProceedCheck}>
                  YES
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
