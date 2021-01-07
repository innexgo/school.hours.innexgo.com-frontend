//copied from tg's reports layout

// TODO
// @jordan you need to add:
// One row with:
// Buttons for each course membership currently in (Should go to InstructorManageCourse or StudentManageCourse)
// One row with:
// Buttons for each school you have a current adminship in
// One row with:
// A simple button going to your own settings
// + anything else you feel like


import React from 'react'
import DashboardLayout from '../components/DashboardLayout';
import { Container, Col, Row } from 'react-bootstrap';

function Report(props: AuthenticatedComponentProps) {

  return (
    <DashboardLayout {...props}>
      <Container fluid>
        <Row>
          <Col sm={8} style={{ marginTop: "-1.5rem" }}> /**/ </Col>
          <Col sm={4}> /**/ </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
};

export default Report;
