// payment terms and discount
// base crypto payments (to be added by the seller)

import React, { useContext } from "react";
import { Form, Input, Select, DatePicker, Space } from 'antd';
import ContractContext from "../ContextObj";

const { Option } = Select;



const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 16,
    },
};

const supportedCurrencies = [
    { "symbol":"BTC"  , "name":"Bitcoin" },
    { "symbol":"BAND" , "name":"Band"},
   // { "symbol":"BNB"  , "name":"Binance" },
    { "symbol":"ETH"  , "name":"Ethereum" },
   // { "symbol":"LTC"  , "name":"Litecoin" },
]

const Negotiations = (props) => {
    const formRef = React.createRef();
    const { state, setState, viewMode } = useContext(ContractContext);

    return (
        <div>
            <Form.Item name="paymentType" label="Currency" rules={[{ required: true, },]}>
                <Select value={state.paymentType} disabled={props.current !== 1 || viewMode === 0}>
                    {/* <Option value="usd">USD</Option>
                    <Option value="usdt">Tether (USDT)</Option>
                    <Option value="usdc">USDC</Option>
                    <Option value="pax">PAX</Option>
                    <Option value="busd">BUSD</Option>
                    <Option value="tusd">TrueUSD</Option>
                    <Option value="dai">DAI</Option>
                    <Option value="eth">Eth</Option> */}
                    {supportedCurrencies.map(e=><Option value={e.symbol.toLowerCase()}>{e.name}</Option>)}
                </Select>
            </Form.Item>
            {
                props.current >= 1 ? (<div><Form.Item name="terms" label="Terms" rules={[{ required: true, },]}>
                    <Select value={state.terms} disabled={props.current !== 1 || viewMode === 0}>
                        <Option value="net15">Net15</Option>
                        <Option value="net30">Net30</Option>
                        <Option value="net60">Net60</Option>
                        <Option value="net90">Net90</Option>
                        <Option value="eom">EOM</Option>
                    </Select>
                </Form.Item>
                    <Form.Item name="discount" label="Discounts" >
                        <Select value={state.discounts} disabled={props.current !== 1 || viewMode === 0}>
                            <Option value="110">1/10</Option>
                            <Option value="210">2/10</Option>
                            <Option value="310">3/10</Option>
                            <Option value="115">1/15</Option>
                            <Option value="215">2/15</Option>
                            <Option value="315">3/15</Option>
                        </Select>
                    </Form.Item></div>) : null
            }
        </div>
    );

}

export default Negotiations;