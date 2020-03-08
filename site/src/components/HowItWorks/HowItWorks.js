import React from "react";
import { NavLink } from "react-router-dom";

import classes from "./HowItWorks.module.css";

const howItWorks = () => (

  <div className={classes.HowItWorks}>
    <h2>How Waygate Works</h2>
    <ul>
      <li>
        Users can&nbsp;
        <NavLink
          to="/marketplace/issue"
          exact
        >issue
        </NavLink>
        &nbsp;new option contracts on the Ethereum blockchain.
        At the time of issuance, the user must specify:
        <p>&emsp;- the option type (call or put),</p>
        <p>&emsp;- the option expiration (all times are in UTC),</p>
        <p>&emsp;- the strike price in ETH,</p>
        <p>&emsp;- the collateral funding amount (explained further below),</p>
        <p>&emsp;- and the premium in ETH (i.e., the sale price).</p>
      </li>
      <li>
        Separately, users can also&nbsp;
        <NavLink
          to="/marketplace/buy"
          exact
        >
          buy
        </NavLink>
        &nbsp;or&nbsp;
        <NavLink
          to="/marketplace/my-contracts"
          exact
        >
          sell
        </NavLink>
        &nbsp;existing option contracts via Ethereum transactions.
        The current owner can post their contract as available
        or unavailable for sale at any time, and can change the
        premium (i.e., the sale price) at any time, as well.
      </li>
      <li>
        All option contracts have ether as the underlying asset,
        and are settled in ETH. The price reference is ETH/USD.
      </li>
      <li>
        All contract payouts are 100% funded by collateral
        posted by the issuer at the time of contract creation.
        This means that when you buy a contract, the funds
        for any potential payout are already locked inside the
        contract. At expiration, the contract will send you
        any payment you're due, and will refund any remaining
        collateral to the issuer.
      </li>
      <li>
        The maximum payout that can be paid by an option is
        equal to the collateral posted.  Note that this
        "Max Payout" amount is listed with each option
        contract for sale. This is important - it isn't how
        options typically work! The payout for each option
        is effectively capped.
      </li>
      <li>
        There is absolutely no reliance on Waygate, or
        on the contract issuer, to receive payment. However,
        note that ether price information is provided by
        Coinbase, a third party.
      </li>
      <li>
        Posted collateral is refunded to the issuer
        at contract expiry, less any payouts made to
        the current owner.
      </li>
      <li>
        To receive a payout or collateral refund, simply
        "ping" the contract at any time after expiry. A
        ping from any address will trigger all payouts
        and refunds.
      </li>
      <li>
        There is a 1% fee for selling contracts on Waygate, deducted
        from any contract sales. For example, if a contract
        is sold for 1 ether by User A, then User A receives
        0.99 ether, and 0.01 ether goes to Waygate. There
        is no fee for buying or issuing contracts.
      </li>
      <li>
        Users can see their full transaction history under&nbsp;
        <NavLink
          to="/marketplace/my-transactions"
          exact
        >
          My Transactions
        </NavLink>
        .
      </li>
      <li>
        There's no sign-up or log-in, so feel free to jump right in!
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

export default howItWorks;
