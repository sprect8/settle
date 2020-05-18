import React from "react";
import { Layout, Tag } from 'antd';
import PurchaseOrderComponent from "../components/purchaseOrders/PurchaseOrderComponent";
import ContractContext from "../components/ContextObj";
import { StoreContext } from "../redux/store";
import { StoreProvider as ContractsStoreProvider } from "../redux/contracts/store";
import { StoreProvider } from "../redux/purchaseOrders/store";

const { Content } = Layout;

const getColor = (category) => {
    switch (category) {
        case "draft": return "volcano";
        case "review": return "geekblue";
        case "terms": return "green";
        case "delivery": return "purple";
        case "received": return "orange";
        case "invoiced": return "yellow";
        case "paid": return "green";
        default: return "blue";
    }
}

const buyerMode = ["draft", "terms", "received", "paid"];

export default (props) => {
    const { state } = React.useContext(StoreContext);

    // use state supplied, otherwise assume newly created
    const [sts, setState] = React.useState(props.currentState || {
        status: "draft",
        orderDetails: []
    });

    console.log(props.currentState);

    let contractId = props.match && props.match.params.contractId ? props.match.params.contractId : null;
    if (props.contractId) {
        contractId = props.contractId;
    }
    
    // view mode - read only / writeable 
    let viewMode = 1;

    if (props.currentState && props.currentState.contract) {
        if (state.address === props.currentState.contract.buyerAddress) {
            if (buyerMode.indexOf(props.currentState.status) < 0) {
                viewMode = 0;
            }
        }
        else {
            if (state.address === props.currentState.contract.sellerAddress) {
                if (buyerMode.indexOf(props.currentState.status) >= 0) {
                    viewMode = 0;
                }
            }
            else {
                return "Invalid address, cannot access";
            }
        }
    }

    return (
        <ContractContext.Provider value={{ state: sts, setState, viewMode }}>
            <StoreProvider>
                <ContractsStoreProvider>
                    <Layout style={{ padding: 20 }}>
                        <Layout>
                            <Content>
                                <h2>{sts.status === "draft" ? "Create" : "View"} Purchase Order <Tag color={getColor(sts.status)}>{sts.status}</Tag></h2>
                                <PurchaseOrderComponent contractId={contractId}/>
                            </Content>
                        </Layout>
                    </Layout>
                </ContractsStoreProvider>
            </StoreProvider>
        </ContractContext.Provider>);
}