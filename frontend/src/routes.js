import React, { Component, Fragment } from 'react';
import { Route, Switch } from 'react-router';

import Nav from './modules/nav/nav'
import Home from './modules/home';
import Marketplace from './modules/marketplace';
import Item from './modules/item';
import Create from './modules/create';
import Profile from './modules/profile';
import Wallet from './modules/wallet';
import List from './modules/list';

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