// difference between RFP, proposal, and contract 
// RFP issued to seller, proposal issued to buyer, contract is signed by both parties
// proposal and contract differ by signature and contract state (draft-review-negotiation vs issued/active/inactive/expired)

import React, { useContext, useState, useEffect } from "react";
import { Table, Tag, Spin, Button, Modal } from 'antd';
import { StoreProvider, StoreContext } from "../redux/contracts/store";
import CreateRFPPage from "./CreateRFPPage";
import { Redirect } from "react-router-dom";

const getColor = (category) => {
    switch (category) {
        case "issued": return "volcano";
        case "active": return "green";
        case "in-use": return "purple"; // no longer active but have pending PO/Invoices
        case "inactive": return "gray"; // from seller
        case "expired": return "blue"; // from buyer
        default: return "blue";
    }
}

const showContract = (e, contract) => {
    e.preventDefault();
}

const TableObj = (props) => {
    const { state, actions } = useContext(StoreContext);
    const [createPO, setCreatePO] = useState(false);

    const [visible, setVisible] = useState(false);
    const [currentState, setCurrentState] = useState({});

    const columns = [
        {
            title: 'Supplier',
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
            title: 'Active Tier',
            dataIndex: 'activeTier',
            key: 'activeTier',
            render: (tier, record) => {
                if (tier < 0 || tier >= record.tiers.length) return "N/A";
                tier = record.tiers[tier];
                return <span><b>{tier.volume}</b>  ${tier.price} ({tier.currency}) </span>
            }
        },
        {
            title: 'Volume Purchased',
            dataIndex: 'purchased',
            key: 'purchased'
        },
        {
            title: 'Active Purchase Orders',
            dataIndex: 'posActive',
            key: 'posActive'
        },
        {
            title: 'Contract',
            dataIndex: 'contract',
            key: 'contract',
            render: (contract) => {
                return <Button type="link" onClick={e => showContract(e, contract)}>{contract}</Button>
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
            key: 'contractStatus',
            dataIndex: 'contractStatus',
            render: (text) => {
                return <Tag color={getColor(text)}>{text}</Tag>
            }
        },
        {
            title: 'Validity Date',
            dataIndex: 'date',
            key: 'date'
        },
        {
            title: 'Last modified',
            dataIndex: 'lastModified',
            key: 'lastModified'
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

    if (!state.contractsLoaded) {
        if (!state.contractsLoading) {
            actions.getActiveContracts();
        }
        return <Spin />
    }

    if (createPO) {
        return <Redirect to={`/createPurchaseOrders/${currentState.contractId}`} />
    }

    return (<div>
        <Modal
            title="View Contract"
            style={{ top: 20 }}
            bodyStyle={{ padding: 0 }}
            visible={visible}
            footer={null}
            onCancel={e => setVisible(false)}
            width={1280}
        >
            <CreateRFPPage currentState={currentState} style={{ padding: 20 }} />
            <Button onClick={e => setCreatePO(true)}>Create Purchase Order</Button>
        </Modal>
        <Table columns={columns} dataSource={state.loadedContracts}></Table>
    </div>);
}

export default () => {

    return (
        <StoreProvider>
            <TableObj />
        </StoreProvider>
    );
}