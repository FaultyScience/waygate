import React from "react";
import { NavLink } from "react-router-dom";

import classes from "./Faq.module.css";

const faq = () => (

  <div className={classes.Faq}>
    <h2>FAQ</h2>
    <h4>What is Waygate?</h4>
    <p>
      Waygate is a Dapp - a decentralized application. It is
      simply a tool for interacting with the Ethereum blockchain.
      It is not a financial exchange, nor a broker-dealer of
      financial securities.
    </p>
    <h4>Is Waygate regulated by any regulatory authority or body?</h4>
    <p>
      No.
    </p>
    <h4>Have Waygate's core contracts been audited?</h4>
    <p>
      Yes. Waygate's core contracts have been audited and
      verified by Solidified, a leader in smart contract
      audit. We believe our contracts to be secure. You
      can find them on&nbsp;
      <a
        href="https://github.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Github
      </a>
      .
    </p>
    <h4>Do I need to sign up or log in to use Waygate?</h4>
    <p>
      No.
    </p>
    <h4>Is there a fee for using Waygate?</h4>
    <p>
      There is a 1% fee for selling contracts, deducted
      from any contract sales. For example, if a contract
      is sold for 1 ether by User A, then User A receives
      0.99 ether, and 0.01 ether goes to Waygate. There
      is no fee for buying or issuing contracts.
    </p>
    <h4>Does Waygate hold my funds?</h4>
    <p>
      No. Waygate does not hold or handle any user funds
      at any time. When you use Waygate, you are transacting
      directly with other users via blockchain transactions.
      Any collateral you post is locked inside the option
      contract until expiration, and Waygate has no way of
      retrieving it.
    </p>
    <h4>If my funds are lost or stolen, will I be reimbursed?</h4>
    <p>
      No. Waygate does not hold or handle user funds at any
      time. We have no means of recovering your funds if
      they are lost or stolen on the blockchain. Use
      Waygate at your own risk.
    </p>
    <h4>Can I place stop, limit, or entry orders?</h4>
    <p>
      No. Waygate is not a financial exchange, and as such
      does not have many of the features you would expect
      a typical exchange to have. We may add some of these
      features in the future, but have no plans to do so
      at this time.
    </p>
    <h4>Can I view my P&L anywhere?</h4>
    <p>
      No, but the moneyness of each unexpired option you're
      a party to is reported under&nbsp;
      <NavLink
        to="/marketplace/my-contracts"
        exact
      >
        My Contracts
      </NavLink>
      , as well as your total
      current position. Payouts of all expired
      options you were a party to are also reported.
    </p>
    <h4>My option is expired, but I haven't received my
      payout or collateral refund. How do I receive it?</h4>
    <p>
      You need to "ping" the contract under&nbsp;
      <NavLink
        to="/marketplace/my-contracts"
        exact
      >
        My Contracts
      </NavLink>
      &nbsp;to trigger all
      payouts and refunds. Either you or the issuer can
      ping the contract - it doesn't matter who.
      Hit the "ping" button to send the transaction.
    </p>
    <h4>My transaction is stuck, or taking a very long time
      to process. Can I cancel it?</h4>
    <p>
      No. Once a transaction is sent, you must wait for it
      to succeed or fail. However, you can send the same
      transaction again, and if it succeeds before your
      stuck transaction processes, the stuck transaction should
      safely fail when it does finally process. To
      avoid stuck transactions and long waits, it's a
      good idea to supply enough gas for all of your
      transactions. We recommend checking&nbsp;
      <a
        href="https://ethgasstation.info/"
        target="_blank"
        rel="noopener noreferrer"
      >
        ETH Gas Station
      </a>
      &nbsp;often to ensure you're sending sufficient gas
      for speedy transactions.
    </p>
  </div>
);

export default faq;
