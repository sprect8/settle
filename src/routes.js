import React, { useContext } from "react";

import App from "./App";
import "./index.less";
import { Route, Switch } from "react-router-dom";

import { StoreContext } from './redux/store';

import { Spin } from 'antd';

import Inbox from './pages/Inbox';
import CreatePurchaseOrder from './pages/CreatePurchaseOrder';
import CreateRFPPage from './pages/CreateRFPPage';
import Outbox from './pages/Outbox';
import ManageContract from './pages/ManageContract';
import ManageInvoices from './pages/ManageInvoices';
import ManageProposals from './pages/ManageProposals';
import ManagePurchaseOrders from './pages/ManagePurchaseOrders';
import ManageRFPs from './pages/ManageRFPs';
import Registration from "./pages/Registration";
import { sendInfoNotification, closeNotification } from "./components/Notifications";
import Marketplace from "./pages/Marketplace";

export default () => {
    const { state, actions } = useContext(StoreContext);
  console.log(state, actions);
  if (!state.validated) {
    if (!state.validating) {
      console.log("Check registered...");
      actions.checkRegistered();
    }
    sendInfoNotification({
      key: "preregister",
      message: `Checking user registration`,
      description:
        'Validating your registration status with the Blockchain, please wait while we confirm your user details',
      placement: "bottomRight",
      icon: (<Spin />)
    });
    return <div></div>;
  }
  closeNotification("preregister");
  if (!state.registered) {
    return <Registration />
  }
  closeNotification("registered");

  return (
    <App>
      <Switch>
        <Route path="/marketplace">
          <Marketplace/>
        </Route>
        <Route path="/createPurchaseOrders/:contractId" component={CreatePurchaseOrder}/>
        <Route path="/createPurchaseOrders" component={CreatePurchaseOrder}/>          
        <Route path="/createRFP">
          <CreateRFPPage />
        </Route>
        <Route path="/inbox">
          <Inbox />
        </Route>
        <Route path="/outbox">
          <Outbox />
        </Route>
        <Route path="/manageContracts">
          <ManageContract />
        </Route>
        <Route path="/manageInvoices">
          <ManageInvoices />
        </Route>
        <Route path="/manageProposals">
          <ManageProposals />
        </Route>
        <Route path="/managePurchaseOrders">
          <ManagePurchaseOrders />
        </Route>
        <Route path="/manageRFPs">
          <ManageRFPs />
        </Route>
      </Switch>
    </App>
  )
}