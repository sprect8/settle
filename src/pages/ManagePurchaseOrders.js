// list of active RFPs and their current status
// sent - accepted - in progress - ready - in transit - delivered - invoiced - paid
import React, { useContext, useState, useEffect } from "react";
import { Table, Tag, Spin, Button, Modal } from 'antd';
import { StoreProvider, StoreContext } from "../redux/purchaseOrders/store";
import { StoreProvider as ContractProvider, StoreContext as ContractContext } from "../redux/contracts/store";
import CreateRFPPage from "./CreateRFPPage";
import CreatePurchaseOrder from "./CreatePurchaseOrder";

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

const getColumns = (actions, contractActions, setVisible, setType) => {
    const showContract = (contract) => {
        // setCurrentState (contract);
        //actions.
        contractActions.getContractDetails(contract.contractId);
        setVisible(true);
        setType(0);
    };
    const showInvoice = (invoice) => {

        // setCurrentState (invoice);
        setVisible(true);
        setType(2);
    };
    const showPurchaseOrder = (purchaseOrder) => {
        //setCurrentState (purchaseOrder);
        actions.getPODetails(purchaseOrder.poId, purchaseOrder.contractId);
        setVisible(true);
        setType(1);
    };

    const columns = [
        {
            title: 'SNo',
            dataIndex: 'poId',
            key: 'poId'
        },
        {
            title: 'Contract',
            dataIndex: 'contract',
            key: 'contract',
            render: (contract) => {
                return <Button type="link" onClick={e => showContract(contract)}>{contract && contract.product}</Button>
            }
        },
        {
            title: 'Volume',
            key: 'volume',
            dataIndex: 'volume',
            render: (e, record) => {
                return record.orderDetails && record.orderDetails[0].total;
            }
        },
        {
            title: "Price",
            key: 'price',
            dataIndex: 'price',
            render: (e, record) => {
                return record.orderDetails && record.orderDetails.reduce((acc, curr) => acc + curr.price, 0);
            }
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
            title: 'Supplier',
            key: 'seller',
            dataIndex: 'seller',
            render: (e, record) => {
                return record.contract && record.contract.seller;
            }
        },
        {
            title: 'Delivery Date',
            dataIndex: 'date',
            key: 'date'
        },
        {
            title: 'Last modified',
            dataIndex: 'lastModified',
            key: 'lastModified'
        },
        {
            title: 'Invoice',
            dataIndex: 'invoiceId',
            key: 'invoiceId',
            render: (invoice, record) => {
                if (!invoice) {
                    return "No Invoice";
                }
                return <Button type="link" onClick={e => showInvoice(record.invoice)}>Invoice</Button>
            }
        },
        {
            title: 'Purchase Order',
            dataIndex: 'poId',
            key: 'poId',
            render: (contract, record) => {
                return <Button type="link" onClick={e => showPurchaseOrder(record)}>View</Button>
            }
        },
    ];
    return columns;
}

const TableObj = (props) => {
    const { state, actions } = useContext(StoreContext);
    const [visible, setVisible] = useState(false);
    const [type, setType] = useState(0);
    const [currentState, setCurrentState] = useState({});
    const ContractObj = useContext(ContractContext);

    console.log(state, actions);

    if (!state.posLoaded) {
        if (!state.posLoading) actions.getActivePOs();
        return <Spin />
    }

    let name = "Contract";
    if (type === 1) name = "Purchase Order";
    if (type === 2) name = "Invoice";

    let viewComponet = null;
    if (state.loadingSelected || ContractObj.state.loadingSelected) {
        viewComponet = <Spin />
    }
    else {

        if (type === 0) {
            viewComponet = <CreateRFPPage currentState={ContractObj.state.loadedSelected} style={{ padding: 20 }} />;
        }
        else if (type === 1) {
            viewComponet = <CreatePurchaseOrder currentState={state.loadedSelected} style={{ padding: 20 }} contractId={state.loadedSelected.contractId} />;
        }
        else {

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
        <Table columns={getColumns(actions, ContractObj.actions, setVisible, setType)} dataSource={state.loadedPOs}></Table>
    </div>);
}

export default () => {

    return (
        <ContractProvider>
            <StoreProvider>
                <TableObj />
            </StoreProvider>
        </ContractProvider>
    );
}