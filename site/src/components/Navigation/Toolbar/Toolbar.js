import React from "react";
import { withRouter } from "react-router-dom";

import classes from "./Toolbar.module.css";
import NavLogo from "../NavLogo/NavLogo";
import NavItem from "../NavItem/NavItem";
import MarketNavItem from "../MarketNavItem/MarketNavItem";

const toolbar = props => {

  let marketNavClasses = [classes.MarketplaceNav];

  if (!props.location.pathname.startsWith("/marketplace")) {
    marketNavClasses.push(classes.Hidden);
  }

  marketNavClasses = marketNavClasses.join(" ");

  return (

    <div className={classes.Toolbar}>
      <div className={classes.Wrapper}>
        <ul>
          <NavItem link="/" exact>Home</NavItem>
          <NavItem link="/how-it-works" exact>How It Works</NavItem>
          <NavItem link="/marketplace">Marketplace</NavItem>
          <NavItem link="/faq" exact>FAQ</NavItem>
        </ul>
      </div>
      <div className={marketNavClasses}>
        <ul>
          <MarketNavItem link="/marketplace/my-contracts" exact>My Contracts</MarketNavItem>
          <MarketNavItem link="/marketplace/browse" exact>Browse Market</MarketNavItem>
          <MarketNavItem link="/marketplace/issue" exact>Issue Contracts</MarketNavItem>
          <MarketNavItem link="/marketplace/my-transactions" exact>My Transactions</MarketNavItem>
        </ul>
      </div>
      <NavLogo />
    </div>
  );
};

export default withRouter(toolbar);
