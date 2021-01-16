import React from 'react';
import { Async, AsyncProps } from 'react-async';

import DashboardLayout from '../components/DashboardLayout';
import { Tab, Tabs, Form, Popover, Container, Row, Col, Card } from 'react-bootstrap';
import { viewCourse, viewCourseMembership, viewCourseKey, isApiErrorCode } from '../utils/utils';

import UtilityWrapper from '../components/UtilityWrapper';


type AddCourseFormProps = {
  apiKey: ApiKey,
  onSuccess: () => void;
}

function AddCourseForm(props: AddCourseFormProps) {
  return <> </>
}

function AddCourse(props: AuthenticatedComponentProps) {
  return (
    <DashboardLayout {...props}>
      <Container fluid className="py-3 px-3">
        <UtilityWrapper title="Join Course as Student">
          <Popover id="information-tooltip">
            Paste the invite link recieved from your teacher to gain access to course resources.
          </Popover>
          <AddCourseForm apiKey={props.apiKey} onSuccess={() => { }} />
        </UtilityWrapper>
      </Container>
    </DashboardLayout>
  );
}

export default AddCourse;
