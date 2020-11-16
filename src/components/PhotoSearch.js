import React from "react";
import { db } from "../backend/Firebase";
import { Redirect } from "react-router-dom";
// import { makeStyles } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";

// Idea: pass the state change to the photosearch, set the search text here, then pass the search text to the navbar.
// Put logic in navbar for creating a menu when the search text changes, put the logic in there for changing the search text
// Also pop in logic for searching for users.

export default function Asynchronous() {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [redirect, setRedirect] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [searchType, setSearchType] = React.useState("user");
  const [inputValue, setInputValue] = React.useState("");

  // Only display a loading symbol when the search options are opened and there is more than one option to select from.
  const loading = open && options.length === 0;

  const handleSubmit = (event, value) => {
    // If the value we submitted (by pressing enter) did not match any of the options, revert to searching by keyword.
    if (!options.includes(value)) {
      setSearchType("description");
      console.log("setting search type to descrption");
    }

    // On clicking on an option (or pressing enter) call this submission routine, set the search query to the value
    // that was clicked and turn on redirect so that we are routed to /search.

    setSearchText(value);
    setRedirect(true);
    event.preventDefault();
  };

  React.useEffect(() => {
    // Whenever there is text typed into the serach bar, reset the options to empty so they may be repopulated.
    setOptions([]);
  }, [inputValue]);

  React.useEffect(() => {
    let active = true;

    // Necessary for rerendering the component after multiple redirects. If redirect is true and a user searches via
    // the nav bar on the /search route, redirect remains true after the serach so teh component doesn't rerender.
    // TLDR; force rerender after a redirect.
    if (redirect) {
      setRedirect(false);
    }

    // once it's stopped loading, don't query db.
    if (!loading) {
      return undefined;
    }

    (async () => {
      var response;
      // Get results from db depending on whether user searches for a tag or for a user.
      if (inputValue.startsWith("#")) {
        await db
          .collection("tags")
          .orderBy("tagLower")
          .get()
          .then((snapshot) => {
            response = snapshot.docs.map(
              (doc) => "#" + doc.data().tagLower.trim()
            );
          })
          .catch((error) => {
            console.log(error);
          });
        setSearchType("tag");
      } else {
        await db
          .collection("users")
          .orderBy("username")
          .get()
          .then((snapshot) => {
            response = snapshot.docs.map((doc) => doc.data().username);
          })
          .catch((error) => {
            console.log(error);
          });
        setSearchType("user");
      }

      // Only set options after a successful async response
      if (active) {
        setOptions(response);
      }
    })();
    return () => {
      active = false;
    };
  }, [loading, redirect, inputValue]);

  React.useEffect(() => {
    // Opening and closing the navbar resets the options (indirectly forces the loading this to come back)
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  // If the user isn't calling a redirect, load the component as usual
  if (!redirect) {
    return (
      <Autocomplete
        id="filtered-search-options"
        freeSolo
        style={{ width: 325, textAlign: "left"}}
        open={open}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        getOptionSelected={(option, value) => option === value}
        getOptionLabel={(option) => option}
        options={options}
        loading={loading}
        onChange={handleSubmit}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search users, #tags or description"
            // variant="Standard"
            InputLabelProps={{
              style: {
                "padding-left": "2em",
                "color": "white",
                "flex-grow": "unset",
                "text-align": "left",
              }
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
              style: {
                "padding-left": "2.3em",
                "padding-bottom": "1em",
                "color": "white",
                "text-align": "left",
                "flex-grow": "unset"
              },
            }}
          />
        )}
      />
    );
  }

  // If the user does call a redirect, reroute to search and pass the input value and the type of search as the state.
  return (
    <Redirect
      to={{
        pathname: "/search",
        state: {
          searchText: searchText,
          searchType: searchType,
        },
      }}
    />
  );
}
