import React, { Component } from "react";
import { Route, Switch, withRouter, Redirect } from "react-router-dom";

import "./App.css";
import Toolbar from "./components/Navigation/Toolbar/Toolbar";
import Home from "./components/Home/Home";
import HowItWorks from "./components/HowItWorks/HowItWorks";
import Marketplace from "./components/Marketplace/Marketplace";
import Faq from "./components/Faq/Faq";

class App extends Component {

  render() {

    return (

      <div className="App">
        <Toolbar />
        <Switch>
          <Route path="/faq" component={Faq} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/how-it-works" component={HowItWorks} />
          <Route path="/" exact component={Home} />
          <Redirect to="/" />
        </Switch>
      </div>
    );
  }
}

export default withRouter(App);
