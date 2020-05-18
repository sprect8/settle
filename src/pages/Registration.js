import React, { useContext } from "react";
import { StoreContext } from '../redux/store';
import { Form, Input, Button, Select, Spin } from 'antd';
import { Card, Col, Row } from 'antd';
import { sendInfoNotification } from "../components/Notifications";

const { Option } = Select;
const layout = {
    labelCol: {
        span: 8,
    },
    wrapperCol: {
        span: 16,
    },
};
const tailLayout = {
    wrapperCol: {
        offset: 8,
        span: 16,
    },
};

const Demo = () => {
    const [form] = Form.useForm();
    const { state, actions } = useContext(StoreContext);

    const onGenderChange = value => {

    };

    const onFinish = values => {
        actions.register(values);
        sendInfoNotification({
            key: "registered",
            message: `Registering ${values.name} with Settle`,
            description:
                'Registering your details with the Settle protocol, please wait as we setup your account on the blockchain',
            placement: "bottomRight",
            icon: (<Spin />)

        })
    };

    const onReset = () => {
        form.resetFields();
    };
    console.log(state.address, state.balance);

    return (
        <div className="background" style={{ "overflow": "hidden" }}>
            <div style={{ position: "absolute", "bottom": "10px", "left": "10px", "fontSize": "16px", "color": "white" }}>
                Smart Settle with <br/>
                <img src="/band-logo.png" style={{ height: "28px" }}></img>
            </div>
            <Row gutter={16} type="flex" justify="center" align="middle" style={{ minHeight: '100vh' }}>
                <Col span={7}>
                    <Card title="Register Company" bordered={false} theme="dark">
                        <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
                            <Form.Item
                                label="Address"
                                value={state.address}
                            >
                                {state.address}
                            </Form.Item>
                            <Form.Item
                                label="Balance"
                            >
                                {state.balance}

                            </Form.Item>
                            <Form.Item
                                name="name"
                                label="Company Name"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="role"
                                label="Role"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Select a option and change input text above"
                                    onChange={onGenderChange}
                                    allowClear
                                >
                                    <Option value="1">Buyer</Option>
                                    <Option value="2">Seller</Option>
                                    <Option value="3">Both</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item {...tailLayout}>
                                <Button type="primary" htmlType="submit">
                                    Submit
                            </Button>
                                <Button htmlType="button" onClick={onReset}>
                                    Reset
                            </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
            
        </div>
    );
};

export default Demo;

