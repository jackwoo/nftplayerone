import React, { Component, Fragment } from 'react';
import { Route, Switch } from 'react-router';

import Nav from './modules/nav/nav'
import Home from './modules/nav/home';
import Marketplace from './modules/marketplace/marketplace';
import Item from './modules/marketplace/item';
import Create from './modules/marketplace/create';
import Profile from './modules/profile/profile';
import Wallet from './modules/nav/wallet';
import List from './modules/marketplace/list';

class AllRoutes extends Component {
  render() {
    return (
      <Fragment>
        <Nav/>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/mynft" component={Create} />
          <Route exact path="/marketplace" component={Marketplace} />
          <Route exact path="/marketplace/:item" component={Item} />
          <Route exact path="/marketplace/:item/sell" component={List} />
          <Route exact path="/profile" component={Profile} />
          <Route exact path="/wallet" component={Wallet} />
        </Switch>
      </Fragment>
    );
  }
}

export default AllRoutes;