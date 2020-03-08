import React from "react";
import { NavLink, withRouter } from "react-router-dom";

import classes from "./NavItem.module.css";

const navItem = props => {

  let navItemClasses = [classes.NavItem];

  if ((props.location.pathname.startsWith("/marketplace")) &&
      (props.link === "/marketplace")) {
    navItemClasses.push(classes.Marketplace);
  }

  navItemClasses = navItemClasses.join(" ");

  return (

    <li className={navItemClasses}>
      <NavLink
        to={props.link}
        exact={props.exact}
        activeClassName={classes.active}
      >
        {props.children}
      </NavLink>
    </li>
  );
};

export default withRouter(navItem);
