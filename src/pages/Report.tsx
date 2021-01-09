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

function Report(props: AuthenticatedComponentProps) {
  var schoolsBar = { //css for 'Schools' row in page
        display: 'true' as const,
        width: '100%',
    }

    var coursesTaught = { //Courses I teach
        display: 'true' as const,
        width: '100%',
    }

    var coursesEnrolled = { //Courses I'm enrolled in
        display: 'true' as const,
        width: '100%',
    }

  return (
    <DashboardLayout {...props}>
      <Container fluid className="py-4 px-4">
              <div style={schoolsBar}>
                  <h2>Schools</h2>
                  <Row className="px-3">
                    <SchoolCard userType="Student" schoolName="Santa Teresa High"/>
                  </Row>
              </div>
              <div style={coursesTaught}>
                  <h2>Courses I teach</h2>
                  <Row className="px-3">
                    <CourseTaughtCard numberOfStudents={32} courseName="Math"/>
                  </Row>
              </div>
            <div style={coursesEnrolled}>
                <h2>Courses I'm enrolled in</h2>
                <Row className="px-3">
                  <CourseEnrolledCard teacherName="CAROLE NG" courseName="Computer Science"/>
                  <CourseEnrolledCard teacherName="BOB EXAMPLE HABLHABLHBH" courseName="Psychology blalabalbalblaabablabalb"/>
                  <CourseEnrolledCard teacherName="MILK MAN" courseName="Cooking"/>
                  <CourseEnrolledCard teacherName="WINNIE POOH" courseName="Health"/>
                  <CourseEnrolledCard teacherName="SHAWN WASABI" courseName="Music"/>
                  <CourseEnrolledCard teacherName="GORDON RAMSAY" courseName="Swear words"/>
                  <CourseEnrolledCard teacherName="WATER MAN" courseName="Science"/>
                </Row>
            </div>
      </Container>
                
            </DashboardLayout>
  );
};

export default Report;
