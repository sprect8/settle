// difference between RFP, proposal, and contract 
// RFP issued to seller, proposal issued to buyer, contract is signed by both parties
// proposal and contract differ by signature and contract state (draft-review-negotiation vs issued/active/inactive/expired)

import React, { useContext, useState } from "react";
import { Table, Tag, Spin, Button, Modal } from 'antd';
import { StoreProvider, StoreContext } from "../redux/proposals/store";
import { StoreContext as GlobalStoreContext } from "../redux/store";
import CreateRFPPage from "./CreateRFPPage";

const getColor = (category) => {
    switch (category) {
        case "draft": return "volcano";
        case "review": return "geekblue";
        case "negotiation": return "purple";
        case "declined": return "magenta"; // from seller
        case "closed": return "magenta"; // from buyer
        default: return "blue";
    }
}

const TableObj = (props) => {
    const { state, actions } = useContext(StoreContext);
    const GlobalObj = useContext(GlobalStoreContext);
    console.log(state, actions);
    const [visible, setVisible] = useState(false);


    const showRFPDetails = (rfpId) => {
        actions.getRFPById(rfpId);
        setVisible(true);
    }

    const showProposalDetails = (proposalId) => {
        actions.getProposalDetails(proposalId);
        setVisible(true);
    }

    const columns = [
        {
            title: 'Bidder',
            key: 'seller',
            dataIndex: 'seller'
        },
        {
            title: 'Pricing Tier',
            dataIndex: 'tiers',
            key: 'tiers',
            render: (tiers) => {
                if (!tiers || tiers.length == 0) {
                    return "No Pricing Tiers";
                }
                return <span>Base ${tiers[0].price} ({tiers[0].currency}) {tiers[0].unit} - ({tiers.length} tiers)</span>
            }
        },
        {
            title: 'RFP',
            dataIndex: 'rfpId',
            key: 'rfpId',
            render: (contract) => {
                return <Button type="link" onClick={e => showRFPDetails(contract)}>View RFP</Button>
            }
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
                return <Tag color={getColor(text)}>{text}</Tag>
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
            title: 'View Proposal',
            dataIndex: 'propsal',
            key: 'proposal',
            render: (contract, record) => {
                return <Button type="link" onClick={e => showProposalDetails(record.proposalId)}>View Proposal</Button>
            }
        },
    ];

    if (!state.proposalsLoaded) {
        if (!state.proposalsLoading) {
            actions.getActiveProposals(GlobalObj.state.address);
            
        }
        return <Spin />
    }

    const currentState = state.loadedSelected ? state.loadedSelected : state.rfpDetails;

    return (<div>
        <Modal
            title="View Proposal"
            style={{ top: 20 }}
            bodyStyle={{ padding: 0 }}
            visible={visible}
            footer={null}
            onCancel={e => setVisible(false)}
            width={1280}
        >
            {state.loadingSelected || state.loadingRFPDetails ? <Spin/> : <CreateRFPPage type="Proposal" currentState={currentState} style={{ padding: 20 }} />}
        </Modal>
        <Table columns={columns} dataSource={state.loadedProposals}></Table>
    </div>);
}

export default () => {

    return (
        <StoreProvider>
            <TableObj />
        </StoreProvider>
    );
}