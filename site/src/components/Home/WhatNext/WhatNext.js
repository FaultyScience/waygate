import React from "react";
import { NavLink } from "react-router-dom";

import classes from "./WhatNext.module.css";

const whatNext = () => (

  <div className={classes.WhatNext}>
    <h2>I'm interested! What next?</h2>
    <ul>
      <li>
        To use Waygate, all you need is&nbsp;
        <a
          href="https://metamask.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Metamask
        </a>
        &nbsp;installed on your browser, and ether in your wallet.
      </li>
      <li>
        Learn more about&nbsp;
        <NavLink
          to="/how-it-works"
          exact
        >
          how Waygate works
        </NavLink>
        .  It's not too complicated - we promise.
      </li>
      <li>
        Visit the&nbsp;
        <NavLink
          to="/marketplace"
          exact
        >marketplace
        </NavLink>
        &nbsp;to&nbsp;
        <NavLink
          to="/marketplace/issue"
          exact
        >issue
        </NavLink>
        ,&nbsp;
        <NavLink
          to="/marketplace/buy"
          exact
        >buy
        </NavLink>
        , and&nbsp;
        <NavLink
          to="/marketplace/my-contracts"
          exact
        >sell
        </NavLink>
        &nbsp;option contracts.
      </li>
      <li>
        There's no need to sign up or log in, so feel free to jump right in!
      </li>
    </ul>
    <div className={classes.Wrapper}>
      <NavLink
        to="/marketplace"
        exact
      >
        <div className={classes.Button}>
          <span>Get Started</span>
        </div>
      </NavLink>
    </div>
  </div>
);

export default whatNext;
