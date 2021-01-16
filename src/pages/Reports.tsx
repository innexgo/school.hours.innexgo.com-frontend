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
import { Container, Col, Row, Card } from 'react-bootstrap';
import Section from '../components/Section';


import { ArrowForwardIos, MoreHoriz } from '@material-ui/icons'

interface CourseEnrolledCardProps {
  courseName: string,
};

function CourseEnrolledCard(props: CourseEnrolledCardProps) {
  return (
    <Card style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title>{props.courseName}</Card.Title>
        <a title="Go to course page" href="" >
          <ArrowForwardIos />
        </a>
        <a title="Manage course" href="">
          <MoreHoriz />
        </a>
      </Card.Body>
    </Card>
  )
}

interface CourseTaughtProps {
  numberOfStudents: number,
  courseName: string,
};

function CourseTaughtCard(props: CourseTaughtProps) {
  return (
    <Card>
      <p style={{ color: '#212529', marginBottom: '0' }}>
        {props.numberOfStudents} students enrolled</p>
      <h5 style={{ marginTop: '5px' }}>{props.courseName}</h5>
      <a title="Go to course page" href="" style={{ float: 'left' }}>
        <ArrowForwardIos /></a>
      <a title="Manage course" href="" style={{ float: 'left', marginLeft: '5%' }}>
        <MoreHoriz /></a>
    </Card>
  )
}


type SchoolCardProps = {
  schoolName: string,
};

function SchoolCard(props: SchoolCardProps) {
  const schoolName = (props.schoolName).substring(0, 20)
  return (
    <Card>
      <Card.Body>
        <Card.Title>{schoolName}</Card.Title>
        <a title="Go to school page" href="" style={{ float: 'left' }}>
          <ArrowForwardIos /></a>
        <a title="Manage school" href="" style={{ float: 'left', marginLeft: '5%' }}>
          <MoreHoriz /></a>
      </Card.Body>
    </Card>
  )
}


function Reports(props: AuthenticatedComponentProps) {
  return (
    <DashboardLayout {...props}>
      <Container fluid className="py-4 px-4">
        <Section id="schools_i_administer" name="Schools I Administer">
          <h2>Schools</h2>
          <Row className="px-3">
            <SchoolCard schoolName="Santa Teresa High" />
          </Row>
        </Section>
        <Section id="courses_i_teach" name="Courses I teach">
          <Row>
            <Col className="my-3"><CourseTaughtCard numberOfStudents={32} courseName="Math" /> </Col>
          </Row>
        </Section>
        <Section id="courses_im_enrolled_in" name="Courses I'm enrolled in">
          <Row>
            <Col className="my-3"><CourseEnrolledCard courseName="Computer Science" /></Col>
            <Col className="my-3"><CourseEnrolledCard courseName="Psychology blalabalbalblaabablabalb" /></Col>
            <Col className="my-3"><CourseEnrolledCard courseName="Cooking" /></Col>
            <Col className="my-3"><CourseEnrolledCard courseName="Health" /></Col>
            <Col className="my-3"><CourseEnrolledCard courseName="Music" /></Col>
            <Col className="my-3"><CourseEnrolledCard courseName="Swear words" /></Col>
            <Col className="my-3"><CourseEnrolledCard courseName="Science" /></Col>
            <Col className="my-3"><CourseEnrolledCard courseName="Health" /></Col>
            <Col className="my-3"><CourseEnrolledCard courseName="Music" /></Col>
            <Col className="my-3"><CourseEnrolledCard courseName="Swear words" /></Col>
            <Col className="my-3"><CourseEnrolledCard courseName="Science" /></Col>
          </Row>
        </Section>
      </Container>
    </DashboardLayout>
  );
};

export default Reports;
