import React, { useContext, useEffect } from "react";
import { Space, Divider, Form, Button, Spin } from "antd";

import ContractContext from "../ContextObj";
import DetailsComponent from "./DetailsComponent";
import PaymentComponent from "./PaymentComponent";
import POLineItems from "../purchaseOrders/POLineItems";
import { StoreContext } from "../../redux/invoices/store";
import { StoreContext as GlobalStoreContext } from "../../redux/store";

const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 16,
    },
};

const InvoiceComponent = (props) => {
    let current = 0;
    const formRef = React.createRef();
    const [form] = Form.useForm();
    const { state, setState, viewMode } = React.useContext(ContractContext);

    const onFinish = values => {
        console.log(values);
    };
    const StoreContextObj = useContext(StoreContext);
    const GlobalStoreObj = useContext(GlobalStoreContext);
    
    const settle = values => {
        // state
        // state details
        // 
        console.log(state.contractId, state.invoiceId, state.paymentDetails);
        StoreContextObj.actions.payInvoice(state.contractId, state.invoiceId, state.paymentDetails);
    };

    useEffect(e=>{
        if (StoreContextObj.state.invoicePaid) {
            setState(StoreContextObj.state.invoice);
            StoreContextObj.actions.getActiveInvoices();
            GlobalStoreObj.actions.getMyBalance();
        }
    }, [StoreContextObj.state.invoicePaying]);

    console.log(state, viewMode);

    return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Form {...layout} form={form} ref={formRef} name="control-ref" onFinish={onFinish}>
                <DetailsComponent />

                <Divider plain orientation="left">Order Details</Divider>
                <POLineItems current={6} />

                <div style={{ display: viewMode === 0 ? "none" : "block" }}>
                    <Divider plain orientation="left">Payment</Divider>
                    <PaymentComponent />
                    <Button type="primary" onClick={e=>settle()} disabled={StoreContextObj.state.invoicePaying}>
                        {StoreContextObj.state.invoicePaying?<Spin/> : ""} Settle
                    </Button>
                </div>
            </Form>
        </Space>
    );
}

export default InvoiceComponent;