import React, { useState } from 'react';
import './App.less';
import { Layout } from 'antd';

import {
  withRouter
} from "react-router-dom";

import Header from "./components/Header";
const { Content } = Layout;

const App = withRouter((props) => {
  const [collapsed, toggleCollapsed] = useState(false);
  const { location, children } = props;
  return (
      <Layout style={{ minHeight: '100vh' }} className="background">
        <Layout>
          <Header {...props}/>
          <Layout style={{ padding: '0px' }}>
            <Content
              className=""
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
                height: "100%"
              }}
            >
              {children}
            </Content>
          </Layout>
        </Layout>
      </Layout>
  );

});

export default App;