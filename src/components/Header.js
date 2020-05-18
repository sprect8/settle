import React from "react";

import { Menu, Layout, Dropdown, Button } from 'antd';
import {
  AppstoreOutlined,
  MailOutlined,
  SendOutlined,
  ShopOutlined,
  PaperClipOutlined,
  FileDoneOutlined,
  FileAddOutlined,
  PlusCircleFilled

} from '@ant-design/icons';

import {
  Link
} from "react-router-dom";
import UserDetails from "./UserDetails";

const { Sider } = Layout;

const menu = (
  <Menu>
    <Menu.Item key="0">
      <Link to="/createRFP">New RFP</Link>
    </Menu.Item>
    <Menu.Item key="1">
      <Link to="/createPurchaseOrders">New Purchase Order</Link>
    </Menu.Item>
    <Menu.Item key="2">
      <Link to="/createInvoices">New Invoice</Link>
    </Menu.Item>
  </Menu>
);

export default (props) => {
  const { location } = props;
  const collapsed = false;
  return (<Sider width={200} className="site-layout-background" collapsed={collapsed} style={{ "paddingTop": "5px" }}>

    <Dropdown overlay={menu} trigger={['click']}>
      <Button onClick={e => e.preventDefault()} type="primary" shape="circle" icon={<PlusCircleFilled />}>

      </Button>
    </Dropdown>
    <Menu
      defaultSelectedKeys={[location.pathname]}
      mode="inline"
      theme="dark"
      selectedKeys={[location.pathname]}
    >
      <Menu.Item key="/inbox" icon={<MailOutlined />}>
        <Link style={{ color: "white" }} to="/inbox">Inbox</Link>
      </Menu.Item>
      <Menu.Item key="/outbox" icon={<SendOutlined />}>
        <Link style={{ color: "white" }} to="/outbox">Outbox</Link>
      </Menu.Item>
      <Menu.Item key="/marketplace" icon={<ShopOutlined />}>
        <Link style={{ color: "white" }} to="/marketplace">Marketplace</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="/manageRFPs" icon={<PaperClipOutlined />}>
        <Link style={{ color: "white" }} to="/manageRFPs">RFPs</Link>
      </Menu.Item>
      <Menu.Item key="/manageProposals" icon={<FileAddOutlined />}>
        <Link style={{ color: "white" }} to="/manageProposals">Proposals</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="/manageContracts" icon={<FileDoneOutlined />}>
        <Link style={{ color: "white" }} to="/manageContracts">Contracts</Link>
      </Menu.Item>
      <Menu.Item key="/managePurchaseOrders" icon={<ShopOutlined />}>
        <Link style={{ color: "white" }} to="/managePurchaseOrders">Purchase Orders</Link>
      </Menu.Item>
      <Menu.Item key="/manageInvoices" icon={<AppstoreOutlined />}>
        <Link style={{ color: "white" }} to="/manageInvoices">Invoices</Link>
      </Menu.Item>
    </Menu>
    <UserDetails />
    <div style={{ position: "absolute", "bottom": "10px", "left":"10px", "fontSize":"16px", "color":"white"}}>
      Smart Settle with
    <img src="/band-logo.png" style={{height:"28px"}}></img>
    </div>
  </Sider>);
}