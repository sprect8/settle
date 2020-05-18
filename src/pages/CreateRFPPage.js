import React from "react";
import { Layout, Tag } from 'antd';
import RFPComponent from "../components/contract/RFPComponent";
import ContractContext from "../components/ContextObj";
import { StoreContext } from "../redux/store";
import { StoreProvider } from "../redux/rfps/store";
const { Content } = Layout;

const getColor = (category) => {
    switch (category) {
        case "draft": return "gold";
        case "issued": return "volcano";
        case "review": return "geekblue";
        case "award": return "green";
        case "negotiation": return "purple";
        case "declined": return "red";
        default: return "blue";
    }
}

const ownerActions = ["draft", "review", "response", "award"]

export default (props) => {
    // const status = props.status || "draft";

    const { state } = React.useContext(StoreContext);

    // use state supplied, otherwise assume newly created
    const [sts, setState] = React.useState(props.currentState || {
        buyerAddress: state.address,
        buyer: state.companyName,
        role: state.companyRole,
        status: "draft"
    });
    
    // view mode - read only / writeable 
    let viewMode = 1;
    let owner = sts.buyerAddress === state.address;

    if (owner) {
        viewMode = ownerActions.indexOf(sts.status) >= 0 ? 1 : 0;
    } 
    else {
        viewMode =  ownerActions.indexOf(sts.status) >= 0 ? 0 : 1;
    }

    let heading = "Manage";
    if (!props.currentState) {
        heading = "Create";
    }
    else {
        if (viewMode === 0) {
            heading = "Reviewing";
        }
    }
    if (sts.status === "signature") {
        viewMode = 1; // both can view a signature state and edit it
    }

    if (sts.status === "declined" || sts.status === "awarded") {
        viewMode = 0; // awarded/declined, you can only view it
    }
    return (
        <ContractContext.Provider value={{ state: sts, setState, viewMode }}>
            <StoreProvider>
                <Layout style={{padding:20}}>
                    <Layout>
                        <Content>
                            <h2>{heading} {props.type || "RFP"} <Tag color={getColor(sts.status)}>{sts.status}</Tag></h2>
                            <RFPComponent status={sts.status} type={props.type || "RFP"}></RFPComponent>
                        </Content>
                    </Layout>
                </Layout>
            </StoreProvider>
        </ContractContext.Provider>
    );
};