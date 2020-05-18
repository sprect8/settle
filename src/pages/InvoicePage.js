import React from "react";
import { Layout, Tag } from 'antd';
import ContractContext from "../components/ContextObj";
import { StoreContext } from "../redux/store";
import { StoreProvider as ContractsStoreProvider } from "../redux/contracts/store";
import { StoreProvider } from "../redux/purchaseOrders/store";
import InvoiceComponent from "../components/invoices/InvoiceComponent";

const { Content } = Layout;

const getColor = (category) => {
    switch (category) {
        case "draft": return "volcano";
        case "review": return "geekblue";
        case "terms": return "green";
        case "delivery": return "purple";
        case "received": return "orange";
        case "invoiced": return "yellow";
        case "paid": return "aqua";
        default: return "blue";
    }
}

const buyerMode = ["draft", "terms", "received", "paid"];

export default (props) => {
    const { state } = React.useContext(StoreContext);

    // use state supplied, otherwise assume newly created
    const [sts, setState] = React.useState(props.currentState || {
        orderDetails: []
    });

    console.log(props.currentState);

    let contractId = props.match && props.match.params.contractId ? props.match.params.contractId : null;
    if (props.contractId) {
        contractId = props.contractId;
    }
    
    // view mode - read only / writeable 
    let viewMode = state.address === sts.buyerAddress ? 1 : 0;
    
    if (props.currentState && (props.currentState.status.indexOf("paid") >= 0)) {
        viewMode = 0;
    }

    return (
        <ContractContext.Provider value={{ state: sts, setState, viewMode, address:state.address }}>
            <StoreProvider>
                <ContractsStoreProvider>
                    <Layout style={{ padding: 20 }}>
                        <Layout>
                            <Content>
                                <InvoiceComponent/>
                            </Content>
                        </Layout>
                    </Layout>
                </ContractsStoreProvider>
            </StoreProvider>
        </ContractContext.Provider>);
}