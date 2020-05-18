import React from "react";
import ContractContext from "../ContextObj";
import CurrencyList from "./CurrencyListComponent";
import { Row, Col, Button } from "antd";
import { StoreContext } from "../../redux/invoices/store";
import moment from 'moment';

// payment details
// including discount
// payment due date
// 
const PaymentComponent = (props) => {
    const { state, setState, viewMode } = React.useContext(ContractContext);
    const StoreContextObj = React.useContext(StoreContext);

    const terms = (state.discount ? state.discount : "") + "@" + state.terms;
    let discount = "N/A";
    let eligibleDiscounts = 0;
    if (state.discount) {
        discount = +state.totalOwed * +((state.discount + "").substring(0, 1)) / 100;
        let date = +((state.discount+"").substring(1,3));
        let payDate = state.issueDate.add(date, "days");
        eligibleDiscounts = discount;
        discount += " (if paid before " + payDate.format('MMM Do YYYY')+")";
        if (payDate < moment()) {
            eligibleDiscounts = 0;
            discount = "Discount Terms Expired";
        }
    }
    return (<>
        <Row gutter={[32, 12]}>
            <Col span={18}>
                <CurrencyList />
            </Col>
            <Col span={6}>
                <h1>Balance: USD ${state.totalOwed - state.totalPaid - eligibleDiscounts} (in {state.paymentType})</h1>
                <h3>Due: {state.dueDate.format('MMM Do YYYY')}</h3>
                <div>Discounts Active: USD ${discount}</div>
                <br/>
                <div>Invoice Date: {state.issueDate.format('MMM Do YYYY')}</div>
                <div>Invoice Amt: USD ${state.totalOwed}</div>
                <div>Invoice Paid: USD ${state.totalPaid}</div>
                <div>Payment Terms: {terms}</div>
                
    
            </Col>
        </Row>
    </>)
};

export default PaymentComponent;