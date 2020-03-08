import React from "react";
import { NavLink } from "react-router-dom";

import classes from "./HowItWorks.module.css";

const howItWorks = () => (

  <div className={classes.HowItWorks}>
    <h2>How Does It Work?</h2>
    <div className={classes.Card}>
      <div className={classes.Title}>1| Create</div>
      <p>Create option contracts and issue them on the Ethereum blockchain.</p>
    </div>
    <p className={classes.Arrow}>d</p>
    <div className={classes.Card}>
      <div className={classes.Title}>2| Transact</div>
      <p>Buy and sell existing option contracts in the marketplace.</p>
    </div>
    <p className={classes.Arrow}>d</p>
    <div className={classes.Card}>
      <div className={classes.Title}>3| Collect</div>
      <p>Wait for any contracts you own to expire, and then collect any profits! Settlement is paid in ether.</p>
      <p>Don't worry - all contracts are 100% collateralized by the issuer, so the contract will automatically send you any payment you're due.</p>
    </div>
    <div className={classes.Wrapper}>
      <NavLink
        to="/how-it-works"
        exact
      >
        <div className={classes.Button}>
          <span>Learn More</span>
        </div>
      </NavLink>
    </div>
  </div>
);

export default howItWorks;
