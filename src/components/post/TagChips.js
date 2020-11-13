import React from "react";
import { useHistory } from "react-router-dom";
import Chip from "@material-ui/core/Chip";
import Typography from "@material-ui/core/Typography";

export default function TagChips(props) {
  const { tags } = props;
  const history = useHistory("");

  // Clicking on tag chips redirects to a search for that tag
  const handleChipClick = (event) => {
    history.push({
      pathname: "/search",
      state: {
        searchText: event.target.textContent,
        searchType: "tag",
      },
    });
  };

  return (
    <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", paddingLeft: 20}}>
      <Typography paragraph style={{ marginRight: 20}}>
        Tags:{" "}
      </Typography>
      {tags.map((tag, index) => (
        <Chip
          label={"#" + tag}
          key={index}
          clickable
          onClick={handleChipClick}
          style={{ marignLeft: 5, marginRight: 5}}
        />
      ))}
    </div>
  );
}
