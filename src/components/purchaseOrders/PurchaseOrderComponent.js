// 1. selection of contract object 
// 2. view of contract details (applicable volume discounts, current purchases)
// 3. selection of amount to purchase, and estimated costs 
// flow = // (sent - buyer) - (seller terms (additional cost line items) - seller), (buyer accepted - buyer )
// - (in progress- seller) - (ready -seller) - (in transit - seller) - (delivered seller) - (acknowledged buyer) - (invoiced seller) - (paid buyer)
import React, { useEffect } from "react";
import StepComponent from "../StepComponent";
import { Space, Divider, Button, Form, Dropdown, Row, Col, DatePicker, Spin, Alert } from "antd";

import ContractContext from "../ContextObj";
import { StoreContext as GlobalContext } from '../../redux/store';
import { StoreContext as ContractStoreContext } from "../../redux/contracts/store";
import { StoreContext } from "../../redux/purchaseOrders/store";
import POLineItems from "./POLineItems";
import ContractList from "./ContractListComponent";
import { closeNotification, sendInfoNotification } from "../Notifications";
import { Redirect } from "react-router-dom";


const PO_STEPS = [{ title: 'Draft', description: "Buyer" },
{ title: 'Review', description: "Supplier" },
{ title: 'Terms', description: "Buyer" },
// { title: 'Negotiation', description: "Negotiation phase", subTitle: "Supplier" },
{ title: 'Delivery', description: "Supplier" },
{ title: 'Received', description: "Buyer" },
{ title: 'Invoicing', description: "Supplier" },
{ title: 'Payment-Pending', description: "Buyer" }
]; // system auto accepts on payment success

const ACTION_NAME = [
    "Submit", "Submit", "Accept", "Acknowledge Delivered", "Acknowledge Received", "Create Invoice", "Pay Invoice"
];

const layout = {
    labelCol: {
        span: 8,
    },
    wrapperCol: {
        span: 12,
    },
};
const tailLayout = {
    wrapperCol: {
        offset: 0,
        span: 16,
    },
};

const PurchaseOrderComponent = (props) => {
    let current = 0;
    const formRef = React.createRef();
    const [form] = Form.useForm();
    const { state, setState, viewMode } = React.useContext(ContractContext);
    const isPaid = state.status.indexOf("paid") >= 0;

    const ContractStoreObj = React.useContext(ContractStoreContext);

    PO_STEPS.forEach((e, i) => {
        if (e.title.toLowerCase() === state.status) current = i;
    });
    
    if (isPaid) {
        current = PO_STEPS.length - 1;
    }

    useEffect(() => {
        form.setFieldsValue(state);
    });

    const ContextObj = React.useContext(StoreContext);
    const GlobalContextObj = React.useContext(GlobalContext);

    const onFinish = values => {
        console.log(values);
        let status = "";
        if (current + 1 >= PO_STEPS.length) {
            status = "closed";
        }
        else {
            // if 5 then we will also generate the invoice and associate with this purchase order
            status = PO_STEPS[current + 1].title.toLowerCase();
        }
        const newState = { ...state, ...values, status: status };

        if (current === 0) {
            ContextObj.actions.createPurchaseOrder(ContractStoreObj.state.loadedContracts.filter(e => e.contractId === state.contractId)[0], newState);

            sendInfoNotification({
                key: "creatingPO",
                message: `Creating Purchase Order`,
                description:
                    'Please wait while the Purchase Order is generated',
                placement: "bottomRight",
                icon: (<Spin />)
            });
        }
        else if (current === 5) {
            // use invoice
            ContextObj.actions.createInvoice(newState);
            sendInfoNotification({
                key: "creatingPO",
                message: `Updating Purchase Order and Invoice`,
                description:
                    'Please wait while the Purchase Order is being updated and invoice is being auto-generated',
                placement: "bottomRight",
                icon: (<Spin />)
            });
        }
        else {
            ContextObj.actions.updatePurchaseOrder(newState);
            sendInfoNotification({
                key: "creatingPO",
                message: `Updating Purchase Order`,
                description:
                    'Please wait while the Purchase Order is being updated',
                placement: "bottomRight",
                icon: (<Spin />)
            });
        }
    }

    const [contractObj, setContractObj] = React.useState({});

    useEffect(e => { // manage contract obj
        if (!ContractStoreObj.state.loadedContracts || ContractStoreObj.state.loadedContracts.length === 0) {
            return;
        }
        let contractId = 0;
        if (props.contractId) {
            contractId = props.contractId;
        }
        else if (state.contractId) {
            contractId = state.contractId;
        }
        const results = ContractStoreObj.state.loadedContracts.filter(e => e.contractId === contractId);
        if (results.length > 0) {
            setContractObj(results[0]);
            setState({ ...state, contractId: contractId });
        }
    }, [state.contractId, props.contractId, ContractStoreObj.state.loadedContracts]);

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

    if (!ContextObj.state.creatingPO) {
        closeNotification("creatingPO");

        if (ContextObj.state.poObj) {
            if (current === 5) {
                return (<Redirect to="/manageInvoices" />);
            }
            return (<Redirect to="/managePurchaseOrders" />);
        }
    }

    return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <StepComponent steps={PO_STEPS} current={current} />
            <div>
                <Divider plain orientation="left">General</Divider>
                <img src="/paid.png" style={{
                    "display": isPaid ? "block" : "none", "height": "150px", position: "absolute",
                    "top": "50px", "right": "20px"
                }} alt="Paid icon" />

                <div style={{ display: current === 6 && !isPaid ? "block" : "none" }}>
                    <Alert
                        message="Purchase Order Auto-close"
                        description={
                            <div>Purchase Order will auto-close upon payment of associated
                        <Button type="link">invoice</Button></div>}
                        type="info"
                        showIcon
                    />
                </div>
            </div>
            <Form {...layout} form={form} ref={formRef} name="control-ref" onFinish={onFinish}>

                <Row gutter={[32, 12]}>
                    <Col span={12}>
                        <Form.Item
                            label="Details"
                        >
                            {props.contractId ? contractObj.product : <ContractList current={current} />}<br /><Button>Contract</Button> <Button disabled={current < 5}>Invoice</Button>
                        </Form.Item>

                        <Form.Item
                            label="Parties"
                        >
                            <b>Buyer:</b> {contractObj.buyer} <br />
                            <b>Seller:</b> {contractObj.seller}
                        </Form.Item>

                    </Col>
                    <Col span={12}>
                        <Form.Item name="deliveryDate" label="Delivery Date" rules={[{ required: true, },]} value={state.date}>
                            <DatePicker disabled={current > 0 || ContextObj.state.creatingPO || viewMode === 0} />
                        </Form.Item>

                        <Form.Item
                            label="History"
                        >
                            <b>Purchased:</b> {contractObj.purchased} |  <b>Active Tiers:</b> {contractObj.activeTier}
                        </Form.Item>
                        <div style={{ display: isPaid ? "block" : "none" }}>
                            <Form.Item
                                label="Paid"
                            >
                                <b>Total Paid:</b> {state.totalPaid}
                                <b>Date Paid:</b> {state.paymentDate && state.paymentDate.format("MMM Do YYYY")}
                            </Form.Item>
                        </div>
                    </Col>
                </Row>
                <div>
                    <Divider plain orientation="left">Order Details</Divider>
                    <POLineItems current={current} />
                </div>
                <div style={{ display: current < 6 && !isPaid ? "block" : "none" }}>
                    <Divider plain orientation="left" />
                    <Form.Item {...tailLayout}>

                        <div style={{ display: current < 6 && !isPaid ? "block" : "none" }}>
                            <Button type="primary" htmlType="submit" disabled={ContextObj.state.creatingPO || viewMode === 0}>
                                {ACTION_NAME[current]}
                            </Button>
                        </div>
                    </Form.Item>
                </div>
            </Form>
        </Space>
    );

}

export default PurchaseOrderComponent;