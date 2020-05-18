import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import "./index.less";
import * as serviceWorker from "./serviceWorker";
import { HashRouter as Router } from "react-router-dom";

import { StoreProvider } from './redux/store';
import Routes from "./routes";


const Protected = ({ ...rest }) => {
  return (<Routes/>);
}

const Render = (props) => {

  return (
    <Router>
      <Protected />
    </Router>
  )
}

console.log(ReactDOM);

ReactDOM.render(
  <StoreProvider>
    <React.StrictMode>
      <Render />
    </React.StrictMode>
  </StoreProvider>,

  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
