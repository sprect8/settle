import React from "react";
import { Row, Col } from "antd";
import moment from "moment";
import ContractContext from "../ContextObj";

// payment details
// including discount
// payment due date
// 
// invoice date / invoice amount / purchase order / contract
// biller = company name 
// company account address
//
// Billed to -
// Shipped to - 

const DetailsComponent = (props) => {

    const { state, setState, viewMode } = React.useContext(ContractContext);
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
        <img src="/paid.png" style={{
            "display": state.status.indexOf("paid") >= 0 ? "block" : "none", "height":"150px", position:"absolute", 
            "top":"50px", "right":"20px"
            }} alt="Paid icon"/>
                <Row gutter = { [32, 12] }>
            < Col span={16}>
            <div><b>From: </b></div>
            <h2>{state.seller}</h2>
            <div>{state.sellerAddress}</div>
            </Col>
        <Col span={8}>
            <h3>Balance: {state.totalOwed - state.totalPaid - eligibleDiscounts}</h3>
            <div>Amt Owed: {state.totalOwed} (discount: {eligibleDiscounts})</div>
            <div>Amt Paid: {state.totalPaid}</div>
            {state.status.indexOf("paid") >= 0 ? <div>Settlement Date:{state.paymentDate.format('MMM Do YYYY')}</div> : null}
        </Col>
    </Row>
        <Row gutter={[32, 12]}>
            <Col span={16}>
                <b>Attn:</b>
                <div> {state.buyer}</div>
                <div> {state.buyerAddress}</div>
            </Col>
            <Col span={8}>
                <div>Invoice Id: {state.invoiceId}</div>
                <div>Invoice Date: {state.issueDate.format('MMM Do YYYY')}</div>
                <div>Due Date: {state.dueDate.format('MMM Do YYYY')}</div>
                <div>Invoice Status: {state.status}</div>
            </Col>
        </Row></>);
};

export default DetailsComponent;