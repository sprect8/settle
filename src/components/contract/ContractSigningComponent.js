// payment terms and discount
// base crypto payments (to be added by the seller)

import React, { useContext } from "react";
import { Space, Button } from 'antd';
import { Card, Modal } from 'antd';
import ContractContext from "../ContextObj";
import { StoreContext } from "../../redux/store";
import { ExclamationCircleOutlined, SafetyOutlined, FormOutlined } from '@ant-design/icons';
const { Meta } = Card;


const CardObj = (props) => {
  const { state, setState, viewMode } = useContext(ContractContext);

  return (<Card
    style={{ width: 300 }}
    cover={
      <img
        alt="example"
        src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
      />
    }
    actions={[
      <Button type={props.signer ? "primary" : "dashed"} disabled={!props.signer || props.signed || viewMode === 0} onClick={e => {
        Modal.confirm({
          title: 'Confirm Signing Contract',
          okText: "Sign Contract",
          cancelText: "Cancel",
          icon: <ExclamationCircleOutlined />,
          onOk: () => {
            
            const newState = { ...state };
            if (props.account === state.buyerAddress) {
              newState.buyerSigned = true;
            }
            else {
              newState.sellerSigned = true;
            }
            setState(newState);
          },
          content: (
            <div>
              By Signing this contract you ({e.participant}) agree to the terms and conditions specified with {e.otherParty}.
            A digital copy of the contract will be stored on the Blockchain with your digital signature.
            </div>
          ),
        });
      }}
        icon={props.signed ? <SafetyOutlined /> : <FormOutlined />}
      >{props.signed ? "Contract Signed" : "Digital Sign Contract"}</Button>,
    ]}
  >
    <Meta
      title={props.company}
      description={props.account}
    />
  </Card>);
}


const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 16,
  },
};

const ContractSigning = (props) => {

  const { state, setState } = useContext(ContractContext);
  const Context = useContext(StoreContext);

  console.log(state);

  return (
    <Space direction="horizontal" size="large" align="center">
      <CardObj company={state.buyer} account={state.buyerAddress}
        participant={state.buyer} otherParty={state.seller}
        signed={state.buyerSigned}
        signer={state.buyerAddress === Context.state.address} />

      <CardObj company={state.seller} account={state.sellerAddress}
        participant={state.seller}
        otherParty={state.buyer}
        signed={state.sellerSigned}
        signer={state.sellerAddress === Context.state.address} />
    </Space>
  );

}

export default ContractSigning;