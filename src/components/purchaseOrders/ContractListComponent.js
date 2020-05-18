// payment terms and discount
// base crypto payments (to be added by the seller)

import React, { useContext, useEffect } from "react";
import { Form, Input, Select, DatePicker, Space, Spin, Alert } from 'antd';
import ContractContext from "../ContextObj";

import { StoreContext as ContractStoreContext } from "../../redux/contracts/store";
import { StoreContext } from "../../redux/purchaseOrders/store";


const { Option } = Select;



const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 16,
    },
};

const ContractList = (props) => {
    const formRef = React.createRef();
    const { state, setState, viewMode } = useContext(ContractContext);
    const ContractStoreObj = useContext(ContractStoreContext);
    const POContextObj = useContext(StoreContext);

    console.log(ContractStoreObj.state);
    if (!ContractStoreObj.state.contractsLoaded) {
        if (!ContractStoreObj.state.contractsLoading) {
            ContractStoreObj.actions.getActiveContracts();
        }
        return (<Spin />);
    }

    if (!ContractStoreObj.state.loadedContracts || ContractStoreObj.state.loadedContracts.length === 0) {
        return (
            <Alert
                message="No Contracts"
                description="No currently active contracts, cannot issue a Purchase Order"
                type="info"
                showIcon
            />);
    }



    return (
        <div>
            <Form.Item name="contractId" label="Contract" rules={[{ required: true, },]}>
                <Select value={state.paymentType} disabled={props.current > 0 || viewMode === 0} onChange={e=>setState({...state, contractId:e})}>
                    {ContractStoreObj.state.loadedContracts.map(e => {
                        return (<Option value={e.contractId}>{e.product}</Option>)
                    })}
                </Select>
            </Form.Item>
        </div>
    );

}

export default ContractList;