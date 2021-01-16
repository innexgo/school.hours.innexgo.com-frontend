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

import SchoolCard from '../components/SchoolCard';
import CourseTaughtCard from '../components/CourseTaughtCard';
import CourseEnrolledCard from '../components/CourseEnrolledCard';
import Section from '../components/Section';

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
