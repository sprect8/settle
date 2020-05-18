// list of active RFPs and their current status
// status - create/payment-pending/payment-complete/overdue/
import React, { useContext, useState, useEffect } from "react";
import { Table, Tag, Spin, Button, Modal } from 'antd';
import { StoreProvider, StoreContext } from "../redux/invoices/store";
import { StoreProvider as ContractProvider, StoreContext as ContractContext } from "../redux/contracts/store";
import { StoreProvider as PoProvider, StoreContext as PoStoreContext } from "../redux/purchaseOrders/store";

import { StoreContext as GlobalStoreContext } from "../redux/store";

import CreateRFPPage from "./CreateRFPPage";
import CreatePurchaseOrder from "./CreatePurchaseOrder";
import InvoicePage from "./InvoicePage";

const getColor = (category) => {
    switch (category) {
        case "overdue": return "volcano";
        case "created": return "geekblue";
        case "paid": return "green";
        case "overdue": return "purple";
        default: return "blue";
    }
};

const getColumns = (actions, contractActions, poActions, setVisible, setType) => {

    const showContract = (contractId) => {
        contractActions.getContractDetails(contractId);
        setType(0);
        setVisible(true);
    };
    const showPurchaseOrder = (poId, contractId) => {
        poActions.getPODetails(poId, contractId);
        setType(1); 
        setVisible(true);
    };
    const showInvoice = (invoiceId, contractId) => {
        actions.getInvoiceDetails(invoiceId, contractId);
        setType(2);
        setVisible(true);
    };

    const columns = [
        {
            title: 'SNo',
            dataIndex: 'invoiceId',
            key: 'invoiceId'
        },
        {
            title: 'Product',
            dataIndex: 'product',
            key: 'product',
        },
        {
            title: 'Volume',
            key: 'volume',
            dataIndex: 'volume'
        },
        {
            title: 'Invoice Amount',
            key: 'totalOwed',
            dataIndex: 'totalOwed'
        },
        {
            title: 'Paid',
            key: 'totalPaid',
            dataIndex: 'totalPaid'
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            render: (tag) => {
                return <Tag color={getColor(tag)}>{tag}</Tag>
            }
        },
        {
            title: 'Seller',
            key: 'seller',
            dataIndex: 'seller'
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate'
        },
        {
            title: 'Issue Date',
            dataIndex: 'issueDate',
            key: 'issueDate'
        },
        {
            title: 'Contract',
            dataIndex: 'contractId',
            key: 'contractId',
            render: (contract) => {
                return <Button type="link" onClick={e => showContract(contract)}>View</Button>
            }
        },
        {
            title: 'Purchase Order',
            dataIndex: 'poId',
            key: 'poId',
            render: (poId, record) => {
                return <Button type="link" onClick={e => showPurchaseOrder(poId, record.contractId)}>View</Button>
            }
        },
        {
            title: 'Invoice',
            dataIndex: 'invoiceId',
            key: 'invoiceId',
            render: (invoiceId, record) => {
                return <Button type="link" onClick={e => showInvoice(invoiceId, record.contractId)}>View</Button>
            }
        }
    ];
    return columns;
}

const TableObj = (props) => {
    const [visible, setVisible] = useState(false);
    const [type, setType] = useState(0);
    const PoObj = useContext(PoStoreContext);
    const { state, actions } = useContext(StoreContext);
    const ContractObj = useContext(ContractContext);

    const GlobalStoreObj = useContext(GlobalStoreContext);
    console.log(state, actions);

    useEffect(e=>{
        if (!state.invoicesLoading && !state.invoicesLoaded) actions.getActiveInvoices();
    }, [state.invoicesLoaded]);

    useEffect(e=> {
        if (!GlobalStoreObj.state.balanceRetrieving && !GlobalStoreObj.state.balanceRetrieved) {
            console.log("GET STATUS", state);
            GlobalStoreObj.actions.getMyBalance();
        }
    }, [GlobalStoreObj.state.balanceRetrieved])

    if (!state.invoicesLoaded) {
        return <Spin />
    }

    let name = "Contract";
    if (type === 1) name = "Purchase Order";
    if (type === 2) name = "Invoice";

    let viewComponet = null;
    if (state.loadingSelected || ContractObj.state.loadingSelected || PoObj.state.loadingSelected) {
        viewComponet = <Spin />
    }
    else {

        if (type === 0) {
            viewComponet = <CreateRFPPage currentState={ContractObj.state.loadedSelected} style={{ padding: 20 }} />;
        }
        else if (type === 1) {
            viewComponet = <CreatePurchaseOrder currentState={PoObj.state.loadedSelected} style={{ padding: 20 }} contractId={PoObj.state.loadedSelected.contractId} />;
        }
        else {
            viewComponet = <InvoicePage currentState={state.loadedSelected} style={{padding:20}} contractId={state.loadedSelected.contractId}/>
        }
    }


    return (<div>
        <Modal
            title={"View " + name}
            style={{ top: 20 }}
            bodyStyle={{ padding: 0 }}
            visible={visible}
            footer={null}
            onCancel={e => setVisible(false)}
            width={1280}
        >
            {viewComponet}
        </Modal>
        <Table columns={getColumns(actions, ContractObj.actions, PoObj.actions, setVisible, setType)} dataSource={state.loadedInvoices}></Table>
    </div>);
}

export default () => {

    return (
        <ContractProvider>
            <PoProvider>
                <StoreProvider>
                    <TableObj />
                </StoreProvider>
            </PoProvider>
        </ContractProvider>
    );
}


// Next Steps is to:
// create the invoice view screen
// allow payments
// Need to build out the Invoice View Screen and the Payment section
// > Have a balanceOf for each token

// Things pending:
// Load using service call for all list pages <div
// Inbox
// Outbox
// Popup to close on actions (currently becomes empty screen)

// Once this is complete, start looking at the smart contract layer! 