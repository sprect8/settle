// list of active RFPs and their current status
// RFP issued ->  Responses ->  Negotiation -> Contract Signing -> Awarded
import React, { useContext, useState } from "react";
import { Table, Tag, Spin, Button, Modal } from 'antd';
import { StoreProvider, StoreContext } from "../redux/rfps/store";
import { StoreContext as MasterStoreContext } from "../redux/store";
import CreateRFPPage from "./CreateRFPPage";

const getColor = (category) => {
    switch (category) {
        case "issued": return "volcano";
        case "review": return "geekblue";
        case "award": return "green";
        case "negotiation": return "purple";
        default: return "blue";
    }
};

const TableObj = (props) => {
    const { state, actions } = useContext(StoreContext);
    const Context = useContext(MasterStoreContext);
    const [visible, setVisible] = useState(false);
    const [currentState, setCurrentState] = useState({});
    const columns = [
        {
            title: "Buyer",
            dataIndex: "buyer",
            key: "buyer",
        },
        {
            title: 'Product',
            dataIndex: 'product',
            key: 'product',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            render: (text) => {
                return (<Tag color={getColor(text)}>
                    {text}
                </Tag>);
            }
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date'
        },
        {
            title: 'Last modified',
            dataIndex: 'lastModified',
            key: 'lastModified'
        },
        {
            title: 'Bid',
            render: (text, record) => {
                if (record.buyerAddress === Context.state.address) {
                    return (<Button type="link" onClick={e => {
                        setVisible(true);
                        setCurrentState(record);
                    }}>View</Button>)
                }
                return (<Button type="link" onClick={e => {
                    setVisible(true);
                    setCurrentState(record);
                }}>Bid</Button>);
            }
        }
    ];
    if (!state.rfpsLoaded) {
        if (!Context.state.validating && !Context.state.validated) {
            console.log("Validating", Context.state);
            Context.actions.checkRegistered();
        }
        if (!state.rfpsLoading) actions.getActiveRFPs();
        return <Spin />
    }
    console.log(currentState);
    return (<div>
        <Modal
            title="View RFP"
            style={{ top: 20 }}
            bodyStyle={{ padding: 0}}
            visible={visible}
            footer={null}
            onCancel={e=>setVisible(false)}
            width={1280}
        >
            <CreateRFPPage currentState={currentState} style={{padding:20}}/>
        </Modal>
        <Table columns={columns} dataSource={state.loadedRFPs} />
    </div>);
}

export default () => {

    return (
        <StoreProvider>
            Marketplace
            <TableObj />
        </StoreProvider>
    );
}