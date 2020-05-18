import React, { useContext } from "react";
import { Table, Tag, Spin } from 'antd';
import { StoreProvider, StoreContext } from "../redux/inbox/store";

const getColor = (category) => {
    switch (category) {
        case "rfp": return "volcano";
        case "contract": return "geekblue";
        case "po": return "green";
        case "invoice": return "purple";
        default: return "blue";
    }
}

const columns = [
    {
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
        render: text => <Tag color={getColor(text)}>{text}</Tag>,
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
        title: 'Sender',
        key: 'sender',
        dataIndex: 'sender'
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
];

const TableObj = (props) => {
    const { state, actions } = useContext(StoreContext);
    console.log(state, actions);

    if (!state.inboxItemsLoaded) {
        if (!state.inboxItemsLoading) actions.getInboxItems();
        return <Spin/>
    }

    return <Table columns={columns} dataSource={state.inboxItems}></Table>;
}

export default () => {
    
    return (
        <StoreProvider>
            <TableObj/>
        </StoreProvider>
    );
}