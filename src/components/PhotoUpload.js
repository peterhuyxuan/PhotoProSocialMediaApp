import React, { useState } from "react";
import { getKeywords } from "../backend/keywords";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import Input from "@material-ui/core/Input";
import CircularProgress from "@material-ui/core/CircularProgress";
import { storage, db } from "../backend/Firebase";
import "./PhotoUpload.css";
import firebase from "firebase";

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
  paper: {
    position: "absolute",
    width: 500,
    height: 343,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #DDDFE2",
    outline: "none",
    boxShadow: theme.shadows[5],
    borderRadius: "5px",
  },
}));

function determineWatermarkTextSize(imgWidth, imgHeight) {
  // based on the original image's dimensions, determine as suitable font size for the watermark text
  // for now, only use the width and not consider the height
  if (imgWidth < 300) {
    return 8;
  } else if (imgWidth < 400) {
    return 10;
  } else if (imgWidth < 500) {
    return 14;
  } else if (imgWidth < 600) {
    return 16;
  } else if (imgWidth < 800) {
    return 32;
  } else if (imgWidth < 2000) {
    return 64;
  } else {
    // image is more than 2000px wide
    return 128;
  }
}

export function PhotoUpload(props) {
  const { profile } = props;
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [noLikes, setNoLikes] = useState(0);
  const [image, setImage] = useState("");
  const [imageWatermarked, setImageWatermarked] = useState("");
  const [caption, setCaption] = useState("");
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState("");
  const [tags, setTags] = useState([]);
  const [progress, setProgress] = useState(0);
  const [progress2, setProgress2] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [imageName, setImageName] = useState("");

  const uploadFileWithClick = () => {
    document.getElementsByClassName("imageFile")[0].click();
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleUpload = (event) => {
    event.preventDefault();
    // Random assignment to prevent warning popups
    setNoLikes(0);
    // End random assignments
    if (image === "") {
      db.collection("posts").add({
        timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
        postDescription: caption,
        keywords: getKeywords(caption),
        imageTitle: caption,
        imageURL: image,
        imageURLWatermarked: imageWatermarked,
        numberOfLikes: noLikes,
        profile: profile,
        price: price,
        priceCurrency: currency,
        liked: false,
        tags: tags,
      });
    } else {
      setLoading(true);
      handleClose();
      // first upload the original image
      const uploadTask = storage.ref(`images/${image.name}`).put(image);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progress);
        },
        (error) => {
          alert(error.message);
        },
        () => {
            // next, retrieve the downloadURL for the image once uploaded
          storage
            .ref("images")
            .child(image.name)
            .getDownloadURL()
            .then(async (url) => {
              //console.log("imageHeight: " + imageHeight);
              //console.log("imageWidth: " + imageWidth);
              var parsedURL = encodeURIComponent(url); // encode the url to convert spaces and special chars, etc
              
              // create the API request string, building it up piece by piece
              var watermarkedAPIURLRequest =
                "https://textoverimage.moesif.com/image?image_url=" +
                parsedURL +
                `&overlay_color=ffffff44&text=SAMPLE&text_color=000000ff&text_size=${determineWatermarkTextSize(
                  imageWidth,
                  imageHeight
                )}&x_align=center&y_align=middle`;


              // now perform the GET request with the API
              await fetch(watermarkedAPIURLRequest)
                .then((response) => response.blob())
                .then((wImage) => {
                  var myblob = new Blob([wImage], { type: "image/jpeg" });

                  // do the upload of this watermarked image, similar to the original
                  const uploadTask2 = storage
                    .ref(`images/${image.name + "_watermarked"}`)
                    .put(myblob); //watermarkedSourceURL
                  uploadTask2.on(
                    "state_changed",
                    (snapshot2) => {
                      const progress2 = Math.round(
                        (snapshot2.bytesTransferred / snapshot2.totalBytes) *
                          100
                      );
                      setProgress2(progress2);
                    },
                    (error) => {
                      alert(error.message);
                    },
                    () => {
                      uploadTask2.snapshot.ref
                        .getDownloadURL()
                        .then(function (watermarkedURL) {
                          db.collection("posts").add({
                            timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
                            postDescription: caption,
                            keywords: getKeywords(caption),
                            imageTitle: caption,
                            imageURL: url,
                            imageURLWatermarked: watermarkedURL,
                            numberOfLikes: noLikes,
                            profile: profile,
                            profile_insensitive: profile.toLowerCase(),
                            price: price,
                            priceCurrency: currency,
                            liked: false,
                            tags: tags,
                          });
                        });
                    }
                  );
                  setImageWatermarked(null);
                  setProgress2(0);
                  console.log(progress2);
                });
              setProgress(0);
              setCaption("");
              console.log(comment);
              setComment("");
              setImage(null);
              setLoading(false);
            });
        }
      );
    }

    tags.forEach((tag, index) => {
      db.collection("tags")
        .doc(tag.trim())
        .set({
          tagLower: tag.trim(),
          timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          // console.log(`Added tag: ${tag}`);
        })
        .catch(() => {
          console.error(`Error writing tag: ${tag}`);
        });
    });

    tags.forEach((tag, index) => {
      db.collection("users")
        .doc(profile)
        .collection("tagsFollowed")
        .doc(tag.trim())
        .set({
          tagLower: tag.trim(),
          timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          // console.log(`Added tags followed: ${tag}`);
        })
        .catch(() => {
          console.error(`Error writing tag followed: ${tag}`);
        });
    });
  };

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImageName(e.target.files[0].name);
      var reader = new FileReader();
      reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          console.log(
            "The width is " + img.width + " height is: " + img.height
          );
          setImageWidth(img.width);
          setImageHeight(img.height);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="imageupload">
      <Modal open={open} onClose={handleClose}>
        <div style={modalStyle} className={classes.paper}>
          <form className="imageupload__commentAssign">
            <div className="imageupload__firstSectionModal">
              <h3>Enter your photo details</h3>
            </div>
            <div className="imageupload__secondSectionModal">
              <input
                type="text"
                onChange={(e) => setCaption(e.target.value)}
                onClick={handleOpen}
                placeholder={"Add a cool caption!"}
                style={{ paddingLeft: 10 }}
              />
            </div>
            <hr />
            <div>
              <Button
                type="button"
                onClick={uploadFileWithClick}
                style={{
                  backgroundColor: "#f5f6f7",
                  width: "35%",
                  textTransform: "none",
                  fontWeight: "bold",
                  color: "black",
                  position: "absolute",
                  left: 10,
                  outline: "none",
                }}
              >
                <img
                  src="https://image.flaticon.com/icons/svg/3233/3233027.svg"
                  className="imageupload__gallery"
                  alt=""
                  style={{
                    width: 25,
                    height: 25,
                    position: "absolute",
                    left: 10,
                  }}
                />
                <input
                  type="file"
                  className="imageFile"
                  onChange={handleChange}
                />
                Find Photo
              </Button>
              {imageName.length > 0 ? (
                <p className="uploadTextStyle">{imageName}</p>
              ) : (
                <p className="uploadTextStyleHidden">name</p>
              )}
            </div>

            <div
              className="imageupload__feedModal"
              style={{ marginTop: 20, width: "100.8%" }}
            >
              <div style={{ marginLeft: 10, marginRight: 10, marginTop: 10 }}>
                <Input
                  placeholder="Add Price"
                  inputProps={{ "aria-label": "description" }}
                  style={{ width: "45%" }}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <Input
                  placeholder="Which Currency?"
                  inputProps={{ "aria-label": "description" }}
                  style={{ width: "45%", marginLeft: 24 }}
                  onChange={(e) => setCurrency(e.target.value)}
                />
              </div>
              <div
                style={{
                  margin: 10,
                }}
              >
                <Input
                  placeholder="Add Tags separated by a comma ','"
                  inputProps={{ "aria-label": "description" }}
                  style={{
                    width: "95%",
                  }}
                  onChange={(e) =>
                    setTags(
                      e.target.value
                        .toLowerCase()
                        .split(",")
                        .map((item) => {
                          return item.trim();
                        })
                    )
                  }
                />
              </div>

              <Button
                type="submit"
                onClick={handleUpload}
                style={{
                  width: "95%",
                  marginLeft: 10,
                  marginRight: 10,
                  marginTop: 5,
                  marginBottom: 10,
                  backgroundColor: "#3f51b5",
                  color: "#fff",
                  borderRadius: 3,
                  height: 30,
                  outline: "none",
                }}
              >
                Upload
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <Button
        type="button"
        onClick={handleOpen}
        style={{
          backgroundColor: "#3f51b5",
          width: "100%",
          textTransform: "none",
          fontWeight: "bold",
          color: "white",
          fontSize: 20,
          outline: "none",
        }}
      >
        <img
          src="https://image.flaticon.com/icons/svg/3233/3233027.svg"
          className="imageupload__gallery"
          alt=""
          style={{ width: 40, height: 40, position: "absolute", left: 10 }}
        />
        Upload Photo
      </Button>
      <progress
        value={progress}
        max="100"
        className={`progress ${progress && "show"}`}
      />
      <div className="imageupload">
        <Modal open={loading} onClose={handleClose}>
          <div style={modalStyle} className={classes.paper}>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                marginRight: "-50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <h2>Uploading image right now...</h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
