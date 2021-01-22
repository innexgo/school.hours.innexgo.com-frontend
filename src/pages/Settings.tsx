import React from 'react';
import { Popover, Row, Form, Container } from 'react-bootstrap'

import UtilityWrapper from '../components/UtilityWrapper';

import DashboardLayout from '../components/DashboardLayout';
import PricingBoxOne from '../components/PricingBoxOne';
import PricingBoxTwo from '../components/PricingBoxTwo';
import PricingBoxThree from '../components/PricingBoxThree';

import CreatePassword from '../components/CreatePassword';
import CreateSubscription from '../components/CreateSubscription';

import { Async, AsyncProps } from 'react-async';



function Settings(props: AuthenticatedComponentProps) {

  // TODO actually add backend components to handle changing the name properly
  // Also, make the name and email and password changes into one box initially
  // Then, when you click on them to change, a modal should pop up
  // IMO this would look better than the tiny boxes we have now

  const [successful, setSuccess] = React.useState(false);
  return <DashboardLayout {...props}>
    <Container fluid className="py-4 px-4">
      <div className="mx-3 my-3">
        <UtilityWrapper title="Change Password">
          <Popover id="information-tooltip"> Shows basic information about this course. </Popover>
          {successful
            ? <Form.Text className="text-success">Password changed successfully</Form.Text>
            : <CreatePassword apiKey={props.apiKey} onSuccess={() => setSuccess(true)} />
          }
        </UtilityWrapper>
      </div>

      <div className="mx-3 my-3">
        <UtilityWrapper title="Manage Subscription">
          <Popover id="information-tooltip"> Purchase a premium subscription that permits you to manage classes and schools. </Popover>
          <>
            {successful
              ? <Form.Text className="text-success">Subscription Created Successfully</Form.Text>
              : <CreateSubscription apiKey={props.apiKey} onSuccess={() => setSuccess(true)} />
            }
          </>
        </UtilityWrapper>
      </div>

    </Container>
  </DashboardLayout>
}

export default Settings;
