// RFP issued ->  Responses ->  Negotiation -> Contract Signing -> Awarded
// Buyer created RFP and enter product, 
// Add to marketplace
// Seller picks up RFP and sends quotation (Responses)
// Buyer adds comment and sends to Seller (Negotiation)
// Seller adds comment and sends to Buyer (Negotiation)
// Buyer agrees and signs
// Seller agrees and signs
// Buyer marks contract as awarded to Seller, other bidders are notified their bid is closed

// proposal and contract differ by signature and contract state (draft-review-negotiation vs issued/active/inactive/expired)

import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, DatePicker, Space, Divider, Col, Row, Spin } from 'antd';
import StepComponent from "../StepComponent";
import ContractPricingComponent from "./ContractPricingComponent";
import Negotiations from "./NegotiationComponent";
import ContractSigning from "./ContractSigningComponent";
import ContractContext from "../ContextObj";
import { StoreContext } from "../../redux/rfps/store";
import { StoreContext as GlobalContext } from '../../redux/store';

import { sendInfoNotification, closeNotification } from "../Notifications";
import { Redirect } from "react-router-dom";

const { Option } = Select;
const RFP_STEPS = [{ title: 'Draft', description: "RFP is in draft and not submitted", subTitle: "Buyer" },
{ title: 'Issued', description: "RFP issued to Marketplace", subTitle: "Supplier" },
{ title: 'Response', description: "Supplier(s) have responded", subTitle: "Buyer" },
// { title: 'Negotiation', description: "Negotiation phase", subTitle: "Supplier" },
{ title: 'Signature', description: "Buyer and seller to sign contract", subTitle: "Both" },
{ title: 'Award', description: "Buyer to create the contract", subTitle: "Buyer" }
];

const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 16,
    },
};
const tailLayout = {
    wrapperCol: {
        offset: 0,
        span: 16,
    },
};

const RFPComponent = (props) => {
    const formRef = React.createRef();
    const [form] = Form.useForm();
    const { state, setState, viewMode } = React.useContext(ContractContext);

    const ContextObj = React.useContext(StoreContext);
    const GlobalContextObj = React.useContext(GlobalContext);

    let current = 0;
    RFP_STEPS.forEach((e, i) => {
        if (e.title.toLowerCase() === state.status) current = i;
    });
    if (state.status === "awarded" || state.status === "declined") {
        current = 4; // show everything
    }

    const createContext = () => {
        // create the contract
        // after contract creation we must decline other bids, remove the proposal from the marketplace
        ContextObj.actions.createContract(state); // saving the RFP

        sendInfoNotification({
            key: "creatingRFP",
            message: `Creating Contract between ${state.seller} and ${state.buyer}`,
            description:
                'Please wait while we setup the Contract agreements',
            placement: "bottomRight",
            icon: (<Spin />)
        });
    }

    const onFinish = values => {
        console.log(values);

        if (current === 3) { // progress state
            values.status = RFP_STEPS[current].title.toLowerCase();
            if (state.buyerSigned && state.sellerSigned) {
                values.status = RFP_STEPS[current + 1].title.toLowerCase();
            }
        } else {
            values.status = RFP_STEPS[current + 1].title.toLowerCase();
        }

        const newState = { ...state, ...values };
        // setState(newState)
        if (viewMode === 0) {
            return; // we cannot edit on view mode!
        }

        if (current > 0) {

            if (current === 1) {
                newState.seller = GlobalContextObj.state.companyName;
                newState.sellerAddress = GlobalContextObj.state.address;
                ContextObj.actions.createProposal(newState, newState);
            }
            else {
                ContextObj.actions.updateProposal(newState);
            }

            sendInfoNotification({
                key: "creatingRFP",
                message: `Updating RFP Proposal`,
                description:
                    'Please wait while the proposal is updated',
                placement: "bottomRight",
                icon: (<Spin />)
            });
        }
        else {
            ContextObj.actions.createRFP(newState); // saving the RFP

            sendInfoNotification({
                key: "creatingRFP",
                message: `Creating a new RFP`,
                description:
                    'Please wait while the RFP is issued to the marketplace',
                placement: "bottomRight",
                icon: (<Spin />)
            });
        }
    };

    useEffect(() => {
        form.setFieldsValue(state);
    });

    if (!ContextObj.state.creatingRFP) {
        closeNotification("creatingRFP");
        if (ContextObj.state.rfpObj) {
            if (current === 4) {
                return (<Redirect to="/manageContracts" />);
            }
            if (current > 0) {
                return (<Redirect to="/manageProposals" />);
            }
            return (<Redirect to="/manageRFPs" />);
        }
    }

    return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <StepComponent steps={RFP_STEPS} current={current} />
            <Divider plain orientation="left">General</Divider>

            <Form {...layout} form={form} ref={formRef} name="control-ref" onFinish={onFinish}>
                <Form.Item
                    label="Buyer"
                    value={state.buyer}
                >
                    {state.buyer}
                </Form.Item>
                <Form.Item style={{ display: state.seller ? "flex" : "none" }}
                    label="Bidder"
                    value={state.seller}
                >
                    {state.seller}
                </Form.Item>
                <Form.Item name="product" label="Product" rules={[{ required: true, },]} value={state.product} >
                    <Input disabled={current > 0 || ContextObj.state.creatingRFP || viewMode === 0} />
                </Form.Item>
                <Form.Item name="description" label="Description" rules={[{ required: true, },]} value={state.description}>
                    <Input disabled={current > 0 || ContextObj.state.creatingRFP || viewMode === 0} />
                </Form.Item>
                <Form.Item name="date" label="RFP Submission Date" rules={[{ required: true, },]} value={state.date}>
                    <DatePicker disabled={current > 0 || ContextObj.state.creatingRFP || viewMode === 0} />
                </Form.Item>
                <Form.Item name="validity" label="Contract Validity Period" rules={[{ required: true, },]} value={state.validity} >
                    <DatePicker disabled={current > 0 || ContextObj.state.creatingRFP || viewMode === 0} />
                </Form.Item>
                {current > 0 ? <div style={{ display: current > 0 ? "block" : "none" }}>
                    <Divider plain orientation="left">Pricing</Divider>

                    <Row gutter={[32, 12]}>
                        <Col span={12}>
                            <ContractPricingComponent current={current} tiers={state.tiers} />
                        </Col>
                        <Col span={12}>
                            <h3>Conditions</h3>
                            <Negotiations current={current} />
                        </Col>
                    </Row>


                </div> : null}
                <div style={{ display: current > 2 ? "block" : "none" }}>
                    <Divider plain orientation="left">Contract Agreement</Divider>
                    <ContractSigning current={current} vuewMode={viewMode} />
                </div>
                <Divider plain orientation="left" />
                <div style={{ display: current < 5 ? "block" : "none" }}>
                    <Form.Item {...tailLayout}>
                        <div style={{ display: current === 4 && viewMode === 1 && GlobalContextObj.state.address === state.buyerAddress ? "block" : "none" }}>
                            <Button type="primary" htmlType="button" onClick={createContext} disabled={ContextObj.state.creatingRFP || viewMode === 0}>
                                Create Contract
                            </Button>
                        </div>
                        <div style={{ display: current < 4 ? "block" : "none" }}>
                            <Button type="primary" htmlType="submit" disabled={ContextObj.state.creatingRFP || viewMode === 0}>
                                {current === 2 ? "Accept" : "Submit"}
                            </Button>
                            <Button htmlType="button" disabled={current < 1 || current > 3 || ContextObj.state.creatingRFP || viewMode === 0}>
                                Decline
                            </Button>
                        </div>
                    </Form.Item>
                </div>
            </Form>
        </Space>
    );

}

export default RFPComponent;