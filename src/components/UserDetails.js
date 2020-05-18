import React, { useContext, useEffect } from "react";
import { Descriptions, Spin } from "antd";
import { StoreContext } from "../redux/store";

const UserDetails = (props) => {
    const { state, actions } = useContext(StoreContext);

    useEffect(e=> {
        if (!state.balanceRetrieving && !state.balanceRetrieved) {
            actions.getMyBalance();
        }
    }, [state.balanceRetrieved]);

    if (!state.balanceLoaded) {
        return <Spin/>;
    }

    return (<div style={{ backgroundColor: "white", "margin": "6px", "padding": "10px", "marginTop": "12px"}}>
        <Descriptions title="Details" layout="horizontal" size="small" style={{ color: "white" }}>
            <Descriptions.Item label="Comany" span="3">{state.companyName}</Descriptions.Item>
            <Descriptions.Item label="Address" span="3">{state.address}</Descriptions.Item>
            <Descriptions.Item label="Role" span="3">{["Buyer", "Seller", "Both"][state.companyRole]}</Descriptions.Item>
        </Descriptions>

        <Descriptions title="Balance" layout="horizontal" size="small" style={{ color: "white" }} bordered={true}>
            {
                state.balanceLoaded && state.balanceLoaded.map(e=><Descriptions.Item label={e.name} span={3}>{e.hodling}</Descriptions.Item>)
            }
            <Descriptions.Item label={<b>USD Est</b>} span="3">${state.balanceLoaded && state.balanceLoaded.reduce((acc, curr)=>acc + (+curr.balance), 0)}</Descriptions.Item>
        </Descriptions>
    </div>);
}
export default UserDetails;