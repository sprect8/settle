import React, { useState, useEffect, useContext } from 'react';
import { Table, Input, InputNumber, Form, Select, Button, Spin, PageHeader } from 'antd';
import ContractContext from '../ContextObj';
import { StoreContext as ContractStoreContext } from "../../redux/contracts/store";
import { StoreContext } from "../../redux/store";
import moment from "moment";
import { smartSettlement } from '../../dao/ethDao';
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

// get balance on each currency that i own
// use ERC20 to back each currency as a stable-coin 1:1 mapping for convenience
// do transfer

const CurrencyList = (props) => {
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');

    const { state, setState, viewMode } = React.useContext(ContractContext);
    const StoreContextObj = useContext(StoreContext);

    const [data, setData] = useState([]);
    const [settle, setSettle] = useState(false);

    const save = async key => {
        try {
            const row = await form.validateFields();
            const newData = [...data];
            const index = newData.findIndex(item => key === item.name);

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
            setState({ ...state, paymentDetails: newData });
            //StoreContextObj.actions.estimatePricing(state.contractId, +newData[0].total);
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };
    const isEditing = record => record.name === editingKey;

    useEffect(e=>{
        if (StoreContextObj.state.balanceRetrieved) {
            setData(StoreContextObj.state.balanceLoaded);
            setState({ ...state, paymentDetails: StoreContextObj.state.balanceLoaded });

        }
    }, [StoreContextObj.state.balanceRetrieved]);

    if (!StoreContextObj.state.balanceRetrieved) {
        return <Spin/>
    }

    const edit = record => {
        form.setFieldsValue({
            key: data.length + 1,
            name: '',
            age: '',
            address: '',
            ...record,
        });
        setEditingKey(record.name);
    };

    const cancel = () => {
        setEditingKey('');
    };
    const columns = [
        {
            title: 'Token',
            dataIndex: 'name',
            width: '15%',
            editable: false,
        },
        {
            title: 'Current Balance',
            dataIndex: 'hodling',
            width: '25%',
            editable: false,
        },
        {
            title: 'Value (USD)',
            dataIndex: 'price',
            width: '15%',
            editable: false
        },
        {
            title: 'Balance (USD)',
            dataIndex: 'balance',
            width: '25%',
            editable: false
        },

        {
            title: 'Payment (USD)',
            dataIndex: 'payment',
            width: '25%',
            editable: viewMode !== 0
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
                            onClick={() => save(record.name)}
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
    let eligibleDiscounts = 0;
    let discount = "N/A";
    if (state.discount) {
        discount = +state.totalOwed * +((state.discount + "").substring(0, 1)) / 100;
        let date = +((state.discount+"").substring(1,3));
        let payDate = state.issueDate.add(date, "days");
        eligibleDiscounts = discount;
        if (payDate < moment()) {
            eligibleDiscounts = 0;
        }
    }
    const clearSettle = () => {
        const newData = [];
        data.forEach(e=>{
            e.payment = 0;
            newData.push(e);
        });
        setData(newData);
    }
    const smartSettle = async (e) => {
        setSettle(true);
        const results = await smartSettlement();
        const newData = [];
        let resul = 0;

        data.forEach((e, i)=>{
            if (results && results[i] && results[i].price && results[i].price.result.result.crypto_price_in_usd)
                e.price = results[i].price.result.result.crypto_price_in_usd/100;
            e.balance = e.hodling * e.price;
            e.proof = results[i].proof.proof.evmProofBytes;
            resul += e.balance;            
        })

        data.forEach((e, i)=> {
            e.payment = (state.totalOwed - state.totalPaid - eligibleDiscounts) * e.balance / resul    
            e.payment = Math.ceil(e.payment * 100)/100;
            newData.push(e);
        });
        console.log(data);
        setData(newData);
        setState({ ...state, paymentDetails: newData });
        setSettle(false);
        StoreContextObj.actions.getMyBalance();
    }
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
    const resul = StoreContextObj.state.balanceLoaded ? StoreContextObj.state.balanceLoaded.reduce((acc, curr) => acc + (curr.balance), 0): 0;
    let totals = data.reduce((acc, curr) => acc + (isNaN(curr.payment) ? 0: +curr.payment), 0);
    totals = Math.round(totals);
    const header = (
    <div>
        <div style={{display:"inline"}}>Estimated Balance: USD {resul}</div>
        <div style={{float:"right", display:viewMode === 0 ? "none": "block"}}>
            <div style={{display:"inline"}}>Settlement: USD {totals} </div>
            <Button key="1" onClick={e=>smartSettle()} loading={settle} type="primary" title="Smart Settle will auto settle using your currencies" disabled={resul < state.totalOwed - state.totalPaid}>Smart Settle with Band</Button>
            <Button key="2" onClick={e=>clearSettle()} >Clear</Button>
        </div>
    </div>)
    console.log(StoreContextObj);
    return (
        <Form form={form}>
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
                footer={() => {return header;}}
            />
        </Form>
    );
};

export default CurrencyList;