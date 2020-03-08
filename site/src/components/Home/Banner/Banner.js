import React from "react";

import classes from "./Banner.module.css";

const banner = () => (

  <div className={classes.Banner}>
    <div className={classes.LogoGlow}></div>
    <h2 className={classes.BannerFont}>Waygate</h2>
    <h3 className={classes.Tagline}>Your portal to the blockchain</h3>
    <p>Create, buy, and sell option contracts on the Ethereum blockchain.</p>
  </div>
);

export default banner;
