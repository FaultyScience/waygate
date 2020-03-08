import React from "react";

import classes from "./Footer.module.css";

const footer = () => (

  <div className={classes.Footer}>
    <h4>Contact</h4>
    <p>Questions? Comments? Inquiries? You can reach us at info@waygate.io</p>
    <p className={classes.Note}>
      <strong>Disclaimer:</strong> &nbsp;Waygate is not a
      financial exchange, nor is it a broker-dealer of
      financial securities. Waygate is simply a tool to
      interact with the Ethereum blockchain.
      It is not regulated by any regulatory body.
      Waygate's Ethereum contracts have been audited and
      verified by third-party auditors and we believe them
      to be free of any vulnerabilities. However, Waygate
      makes absolutely no guarantees, and it is not responsible
      for any lost or stolen funds. Use Waygate at your own risk.</p>
  </div>
);

export default footer;
