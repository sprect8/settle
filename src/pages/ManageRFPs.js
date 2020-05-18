// list of active RFPs and their current status
// RFP issued ->  Responses ->  Negotiation -> Contract Signing -> Awarded
import React, { useContext, useState } from "react";
import { Table, Tag, Spin, Button, Modal } from 'antd';
import { StoreProvider, StoreContext } from "../redux/rfps/store";
import { StoreContext as GlobalStoreContext } from "../redux/store";
import CreateRFPPage from './CreateRFPPage';

const getColor = (category) => {
    switch (category) {
        case "issued": return "volcano";
        case "review": return "geekblue";
        case "award": return "green";
        case "negotiation": return "purple";
        default: return "blue";
    }
}

const TableObj = (props) => {
    const { state, actions } = useContext(StoreContext);
    const Context = useContext(GlobalStoreContext);
    const [visible, setVisible] = useState(false);
    const [currentState, setCurrentState] = useState({});

    const columns = [
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
            render:(text) => {
                return <Tag color={getColor(text)}>{text}</Tag>
            }
        },
        {
            title: 'Bidders',
            key: 'bidders',
            dataIndex: 'bidders',
            render:(bidders) => {
                if (!bidders || bidders.length == 0) {
                    return "No Bids";
                }
                return bidders.map(e=> {
                    return <Tag color="success">{e}</Tag>
                });
            }
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: date => date.format("MMM Do YYYY")
        },
        {
            title: 'Last modified',
            dataIndex: 'lastModified',
            key: 'lastModified',
            render: date => date ? date.format("MMM Do YYYY") : ""
        }, 
        {
            title: 'View',
            render: (text, record) => {
                
                return <Button type="link" onClick={e => {
                    setVisible(true);
                    setCurrentState(record);
                }}>View</Button>
            }
        }
    ];  
    console.log(state, actions);

    if (!state.rfpsLoaded) {
        if (!state.rfpsLoading) actions.getMyRFPs(Context.state.address);
        return <Spin/>
    }

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
        <Table columns={columns} dataSource={state.loadedRFPs}></Table></div>
    );
}

export default () => {
    
    return (
        <StoreProvider>
            Manag RFPs
            <TableObj/>
        </StoreProvider>
    );
}