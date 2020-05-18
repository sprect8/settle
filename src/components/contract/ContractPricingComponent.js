import React, { useState } from 'react';
import { Table, Input, InputNumber, Form, Select, Button } from 'antd';
import ContractContext from '../ContextObj';
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

const ContractPricingComponent = (props) => {
    const [form] = Form.useForm();
    const [data, setData] = useState(props.tiers || []);
    const [editingKey, setEditingKey] = useState('');

    const { state, setState, viewMode } = React.useContext(ContractContext);

    const isEditing = record => record.key === editingKey;

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
            setState({ ...state, tiers: newData });
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const columns = [
        {
            title: 'Volume',
            dataIndex: 'volume',
            width: '25%',
            editable: true,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            width: '25%',
            editable: true,
        },
        {
            title: 'Currency',
            dataIndex: 'currency',
            width: '25%',
            editable: true,
        },
        {
            title: 'Unit',
            dataIndex: 'unit'
        },
        {
            title: 'operation',
            dataIndex: 'operation',
            render: (_, record) => {
                if (props.current !== 1) {
                    return "Finalised"
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
    return (
        <Form form={form} component={false}>
            <Button disabled={props.current !== 1 || viewMode === 0} onClick={handleAdd}>Add Tier</Button>
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
            />
        </Form>
    );
};

export default ContractPricingComponent;