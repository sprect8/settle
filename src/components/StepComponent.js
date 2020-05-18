// sent - accepted - in progress - ready - in transit - delivered - invoiced - paid
import React from "react";
import { Steps } from 'antd';
const { Step } = Steps;

// const RFP_STEPS = ['Sent', 'Accepted', 'In-Progress', 'Ready', 'In-Transit', 'Delivered', 'Invoiced', 'Paid'];

const StepComponent = (props) => {
   const { current, steps } = props;
   
   if (!steps) {
       return <div/>;
   }
   
   const render = steps.map(step=>(<Step key={step.title} title={step.title} description={step.description} subTitle={step.subTitle}></Step>));
   return (
       <Steps current={current}>
           {render}
       </Steps>
   )
}

export default StepComponent;