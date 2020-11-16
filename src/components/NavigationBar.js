import React from "react";
import { useHistory } from "react-router-dom";
import { fade, makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";

import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Badge from "@material-ui/core/Badge";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";

import AccountCircle from "@material-ui/icons/AccountCircle";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import SearchIcon from "@material-ui/icons/Search";
import PhotoSearch from "./PhotoSearch";

// Styles for the Nav Bar
const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 1),
    "margin-top": "5%",
    height: "50%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
}));

// Function for the Navigation Bar component and the redirection to the different pages
export default function NavigationBar(props) {
  const { user } = props;
  const classes = useStyles();
  const history = useHistory("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleHomeClick = (event) => {
    event.preventDefault();
    history.push("/");
  };

  const handleProflieClick = (event) => {
    event.preventDefault();
    history.push(`/profile/${user}`);
  };

  const handleAccountClick = (event) => {
    event.preventDefault();
    history.push("/account");
  };

  const handleLogoutClick = (event) => {
    event.preventDefault();
    history.push("/login");
  };

  const handleCollectionClick = (event) => {
    event.preventDefault();
    history.push("/collection");
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleProflieClick}>Profile</MenuItem>
      <MenuItem onClick={handleAccountClick}>My account</MenuItem>
      <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
    </Menu>
  );

  // Rendering the Navigation Bar
  return (
    <div className={classes.grow} style={{ width: "100%", marginBottom: 75 }}>
      <AppBar position="fixed" style={{ padding: 5 }}>
        <Toolbar>
          <Button
            onClick={handleHomeClick}
            style={{ textTransform: "none", color: "white", outline: "none" }}
          >
            <Typography className={classes.title} variant="h6" noWrap>
              PhotoPro
            </Typography>
          </Button>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <PhotoSearch customStyle={classes} />
          </div>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton
              aria-label="collections"
              color="inherit"
              onClick={handleCollectionClick}
              style={{ outline: "none" }}
            >
              <Badge color="secondary">
                <PhotoLibraryIcon />
              </Badge>
            </IconButton>

            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              style={{ outline: "none" }}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMenu}
    </div>
  );
}
