import React, { Component, Fragment } from 'react';
import { Route, Switch } from 'react-router';
import UserModel from './model/UserModel';

import Nav from './modules/nav/nav'
import Home from './modules/nav/home';
import Marketplace from './modules/marketplace/marketplace';
import Item from './modules/marketplace/item';
import Create from './modules/marketplace/create';
import Profile from './modules/profile/profile';
import Wallet from './modules/nav/wallet';
import List from './modules/marketplace/list';
import About from './modules/nav/about';
import Creation from "./modules/marketplace/creation";
import Inwallet from './modules/marketplace/inwallet';
import Activity from './modules/marketplace/activity';

class LoginRoutes extends Component {
  componentDidMount() {
    UserModel.isLogin();
  }

  render() {
    return (
      <Fragment>
        <Switch>
          <Route exact path="/mynft" component={Create} />
          <Route exact path="/home" component={Marketplace} />
          <Route exact path="/marketplace/:item" component={Item} />
          <Route exact path="/marketplace/:item/sell" component={List} />
          <Route exact path="/creation" component={Creation} />
          <Route exact path="/inwallet" component={Inwallet} />
          <Route exact path="/activity" component={Activity} />
          <Route exact path="/profile" component={Profile} />
          <Route exact path="/wallet" component={Wallet} />
        </Switch>
      </Fragment>
    )
  }
}

class AllRoutes extends Component {
  render() {
    return (
      <Fragment>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/about" component={About} />
          <Route component={LoginRoutes}/>
        </Switch>
        <Nav />
      </Fragment>
    );
  }
}

export default AllRoutes;