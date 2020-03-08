import React from "react";
import { NavLink } from "react-router-dom";

import classes from "./MarketNavItem.module.css";

const marketNavItem = props => (

  <li className={classes.MarketNavItem}>
    <NavLink
      to={props.link}
      exact={props.exact}
      activeClassName={classes.active}
    >
      {props.children}
    </NavLink>
  </li>
);

export default marketNavItem;
