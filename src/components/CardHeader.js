import * as React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import withStyles from "@material-ui/styles/withStyles";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";

export const styles = {
  /* Styles applied to the root element. */
  root: {
    display: "flex",
    alignItems: "center",
    padding: 16,
  },
  /* Styles applied to the avatar element. */
  avatar: {
    flex: "0 0 auto",
    marginRight: 16,
  },
  /* Styles applied to the action element. */
  action: {
    flex: "0 0 auto",
    alignSelf: "flex-start",
    marginTop: -8,
    marginRight: -8,
  },
  /* Styles applied to the content wrapper element. */
  content: {
    flex: "1 1 auto",
    textAlign: "left",
  },
  /* Styles applied to the title Typography element. */
  title: {
    fontWeight: "bold",
  },
  /* Styles applied to the subheader Typography element. */
  subheader: { fontWeight: "bold" },
  timeStampHeader: {},
};

// Modified version of the original CardHeader element from MaterialUI
const CardHeader = React.forwardRef(function CardHeader(props, ref) {
  const {
    action,
    avatar,
    classes,
    className,
    component: Component = "div",
    disableTypography = false,
    subheader: subheaderProp,
    subheaderTypographyProps,
    title: titleProp,
    titleTypographyProps,
    postId,
    timeStamp,
    ...other
  } = props;

  // Displaying the name of the contributer who uploaded the image with the link to their profile
  let title = titleProp;
  if (title != null && title.type !== Typography && !disableTypography) {
    title = (
      <Link to={`/profile/${title}`}>
        <Typography
          variant={avatar ? "body2" : "h5"}
          className={classes.title}
          component="span"
          display="block"
          {...titleTypographyProps}
        >
          {title}
        </Typography>
      </Link>
    );
  }

  // Post title with the link to the original post itself
  let subheader = subheaderProp;
  if (
    subheader != null &&
    subheader.type !== Typography &&
    !disableTypography
  ) {
    subheader = (
      <Link to={`/post/${postId}`}>
        <Typography
          variant={avatar ? "body2" : "body1"}
          className={classes.subheader}
          color="textSecondary"
          component="span"
          display="block"
          {...subheaderTypographyProps}
        >
          {subheader}
        </Typography>
      </Link>
    );
  }

  // Header for the post timestamp
  let timeStampHeader = subheaderProp;
  if (
    timeStampHeader != null &&
    timeStampHeader.type !== Typography &&
    !disableTypography
  ) {
    timeStampHeader = (
      <Typography
        variant={avatar ? "body2" : "body1"}
        className={classes.timeStampHeader}
        color="textSecondary"
        component="span"
        display="block"
        {...subheaderTypographyProps}
      >
        {timeStamp}
      </Typography>
    );
  }

  return (
    <Component className={clsx(classes.root, className)} ref={ref} {...other}>
      {avatar && <div className={classes.avatar}>{avatar}</div>}
      <div className={classes.content}>
        {title}
        {subheader}
        {timeStampHeader}
      </div>
      {action && <div className={classes.action}>{action}</div>}
    </Component>
  );
});

CardHeader.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit the d.ts file and run "yarn proptypes"     |
  // ----------------------------------------------------------------------
  /**
   * The action to display in the card header.
   */
  action: PropTypes.node,
  /**
   * The Avatar for the Card Header.
   */
  avatar: PropTypes.node,
  /**
   * @ignore
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   * See [CSS API](#css) below for more details.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  //   component: PropTypes /* @typescript-to-proptypes-ignore */.elementType,
  /**
   * If `true`, `subheader` and `title` won't be wrapped by a Typography component.
   * This can be useful to render an alternative Typography variant by wrapping
   * the `title` text, and optional `subheader` text
   * with the Typography component.
   */
  disableTypography: PropTypes.bool,
  /**
   * The content of the component.
   */
  subheader: PropTypes.node,
  /**
   * These props will be forwarded to the subheader
   * (as long as disableTypography is not `true`).
   */
  subheaderTypographyProps: PropTypes.object,
  /**
   * The content of the Card Title.
   */
  title: PropTypes.node,
  /**
   * These props will be forwarded to the title
   * (as long as disableTypography is not `true`).
   */
  titleTypographyProps: PropTypes.object,
};

export default withStyles(styles, { name: "MuiCardHeader" })(CardHeader);
