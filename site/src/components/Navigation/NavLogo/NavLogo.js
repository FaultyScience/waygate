import React from "react";
import { NavLink, withRouter } from "react-router-dom";

import classes from "./NavLogo.module.css";

const logo = props => (

  <div className={classes.Logo}
       style={props.location.pathname.startsWith("/marketplace")
              ? { marginTop: "-87px" } : null}>
    <NavLink to="/" exact>
      <p>Waygate</p>
      <div className={classes.LogoGlow}></div>
    </NavLink>
  </div>
);

export default withRouter(logo);
