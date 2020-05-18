import React, { useState, useEffect } from 'react';
import { Table, Input, InputNumber, Form, Select, Button, Spin } from 'antd';
import ContractContext from '../ContextObj';
import { StoreContext as ContractStoreContext} from "../../redux/contracts/store";
import { StoreContext } from "../../redux/purchaseOrders/store";

const { Option } = Select;

const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    selections,
    ...restProps
}) => {
    let inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
    if (inputType === 'select') {
        inputNode = (
            <Select value={record}>
                {
                    selections.map(e => {
                        return (<Option value={e}>{e}</Option>)
                    })
                }
            </Select>
        )
    }
    return (
        <td {...restProps} key={dataIndex}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{
                        margin: 0,
                    }}
                    rules={[
                        {
                            required: true,
                            message: `Please Input ${title}!`,
                        },
                    ]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                    children
                )}
        </td>
    );
};

const POLineItems = (props) => {
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');
    const ContractStoreObj = React.useContext(ContractStoreContext);
    const StoreContextObj = React.useContext(StoreContext);

    const { state, setState, viewMode } = React.useContext(ContractContext);
    const [data, setData] = useState(state.orderDetails || [{
        "product": "",
        "volume": 0,

    }]);

    useEffect(e=> {
        if (!state.contractId) return;

        let contractInstance = state.contract;
        
        let orderDetails = state.orderDetails;
        if (!state.orderDetails || state.orderDetails.length == 0) {
            if (!state.contract)
                contractInstance = ContractStoreObj.state.loadedContracts.filter(e=>e.contractId === state.contractId)[0];
                
            orderDetails = [{contractId: state.contractId, lineItem: contractInstance.product, tiers: contractInstance.tiers}]; 
        }
        setState({...state, orderDetails: orderDetails});
        setData(orderDetails);
    }, [state.contractId]);

    // case types.ESTIMATE_PRICING:
    //         return { ...state, estimatingPrice: true, priceEstimated: false};
    //     case types.ESTIMATE_PRICING_CALCULATED:
    //         return { ...state, estimatingPrice: false, priceEstimated: true, estimate: action.payload};
    useEffect(e=> {
        console.log(StoreContextObj.state);
        if (!StoreContextObj.state.priceEstimated) return;

        const orderDetails = state.orderDetails;
        orderDetails[0].price = StoreContextObj.state.estimate;
        setState({...state})
    }, [StoreContextObj.state.estimate]);

    const isEditing = record => record.key === editingKey;

    const pricingTotal = data.length > 0 ? data.reduce((acc, curr) => {
        if (isNaN(curr.price)) return acc;
        return +acc + +curr.price;
    }, 0): 0;

    const edit = record => {
        form.setFieldsValue({
            key: data.length + 1,
            name: '',
            age: '',
            address: '',
            ...record,
        });
        setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async key => {
        try {
            const row = await form.validateFields();
            const newData = [...data];
            const index = newData.findIndex(item => key === item.key);

            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, { ...item, ...row });
                setData(newData);
                setEditingKey('');
            } else {
                newData.push(row);
                setData(newData);
                setEditingKey('');
            }
            setState({ ...state, orderDetails: newData });
            StoreContextObj.actions.estimatePricing(state.contractId, +newData[0].total);
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const columns = [
        {
            title: 'Line Item',
            dataIndex: 'lineItem',
            width: '25%',
            editable: props.current > 0,
        },
        {
            title: 'Units',
            dataIndex: 'total',
            width: '15%',
            editable: true,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            width: '15%',
            editable: props.current > 0,
            render: e=> {
                if (props.current > 0) return e;
                if (StoreContextObj.state.estimatingPrice) {
                    return (<Spin/>);
                }
                else {
                    return e;
                }
            }
        },
        {
            title: 'Tiers',
            dataIndex: 'tiers',
            width: '25%',
            render: (tiers, record) => {                
                if (!tiers || tiers.length === 0) return "N/A";
                return (<div>{tiers.map(tier=><div><span>${tier.volume} ${tier.price} ({tier.currency}) {tier.unit}</span></div>)}</div>);
            }
        },
        {
            title: 'operation',
            dataIndex: 'operation',
            render: (_, record) => {
                if (record.tiers && props.current > 1) {
                    return "Finalised by Buyer";
                }
                if (viewMode === 0) {
                    return "Finalised";
                }
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <a
                            href="javascript:;"
                            onClick={() => save(record.key)}
                            style={{
                                marginRight: 8,
                            }}
                        >
                            Save
                        </a>
                        <a
                            href="javascript:;"
                            onClick={cancel}
                        >Cancel</a>

                    </span>
                ) : (
                        <a disabled={editingKey !== ''} onClick={() => edit(record)}>
                            Edit
                        </a>
                    );
            },
        },
    ];
    const mergedColumns = columns.map(col => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: record => ({
                record,
                inputType: col.dataIndex === 'age' ? 'number' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });
    const handleAdd = () => {
        const newData = {
            key: data.length + 1,
            volume: "",
            price: "",
            currency: "",
            unit: "ppu"
        };
        setData(data.concat(newData));
        setEditingKey(newData.key);
    };
    const resul = pricingTotal;
    return (
        <Form form={form} component={false}>
            <Button disabled={props.current !== 1 || viewMode === 0} onClick={handleAdd}>Add Line Item</Button>
            <Table
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                bordered
                dataSource={data}
                columns={mergedColumns}
                rowClassName="editable-row"
                pagination={{
                    onChange: cancel,
                }}
                footer={() => <div><b>{`Total: ${resul}`}</b></div>}
            />
        </Form>
    );
};

export default POLineItems;