import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Login } from "./view/Login";
import { Register } from "./view/Register";
import { Feed } from "./view/Feed";
import { SearchFeed } from "./view/SearchFeed";
import { Account } from "./view/Account";
import { Collection } from "./view/Collection";
import { Profile } from "./view/Profile";
import { CollectionPosts } from "./view/CollectionPosts";
import { IndividualPost } from "./view/IndividualPost";

import useAppUser, { AppUserProvider } from "./hooks/useAppUser";

var user = "longLiveTheCompClubArmy671";

// To maintain website user persistence
// From https://akhilaariyachandra.com/persistent-state-in-react/
const useStickyState = (key = "sticky", initialState = null) => {
  const [state, setState] = React.useState(() => {
    const storedState = localStorage.getItem(key);

    return storedState ?? initialState;
  });

  React.useEffect(() => {
    localStorage.setItem(key, state);
  }, [key, state]);

  const clearState = () => localStorage.removeItem(key);

  return [state, setState, clearState];
};

// Root App element
function App(props) {
  const [username, setUsername] = useStickyState("sticky", "");

  // Handle changing the different users when logging in and out
  function handleChange(newUser) {
    setUsername(newUser);
    props.username(newUser);
  }

  // Getting the user Context to maintain user consistency
  const _user = useAppUser();

  if (!_user) {
    return null;
  }

  if (username.length) {
    user = username;
  }

  // Rendering all the different pages and their respective routes
  return (
    <div className="App">
      <header className="App-header">
        <Router>
          <Switch>
            <Route path="/login">
              <Login onChange={handleChange} />
            </Route>
            <Route path="/register">
              <Register onChange={handleChange} />
            </Route>
            <Route path="/account">
              <Account user={user} />
            </Route>

            <Route path="/collection">
              <Collection user={user} />
            </Route>
            <Route
              path="/search"
              render={(props) => (
                <div style={{ width: "100%" }}>
                  <SearchFeed
                    user={user}
                    key={props.location.state.searchText}
                    searchText={props.location.state.searchText}
                    searchType={props.location.state.searchType}
                  />
                </div>
              )}
            />
            <Route
              path="/profile/:userId"
              render={(props) => (
                <div style={{ width: "100%" }}>
                  <Profile user={user} {...props} />
                </div>
              )}
            ></Route>

            <Route
              path="/collections/:id"
              render={(props) => (
                <div style={{ width: "100%" }}>
                  <CollectionPosts user={user} {...props} />
                </div>
              )}
            ></Route>

            <Route
              path="/post/:postId"
              render={(props) => (
                <div style={{ width: "100%" }}>
                  <IndividualPost user={user} {...props} />
                </div>
              )}
            ></Route>

            <Route path="/">
              <Feed user={user} />
            </Route>
          </Switch>
        </Router>
      </header>
    </div>
  );
}

// Allow the app to maintain user data consitency through
function AppWithState() {
  const [currentUser, setCurrentUser] = useStickyState("sticky", user);

  // Handling the changing of a different username
  function handleUsername(changeUser) {
    setCurrentUser(changeUser);
  }

  // Render to keep the user account consistent in children elements
  return (
    <AppUserProvider username={currentUser}>
      <App username={handleUsername} />
    </AppUserProvider>
  );
}

export default AppWithState;
