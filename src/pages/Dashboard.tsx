import React from 'react'
import { Container, Card, Form } from 'react-bootstrap';
import { ArrowForwardIos, MoreHoriz, Add } from '@material-ui/icons'
import { Async, AsyncProps } from 'react-async';

import DashboardLayout from '../components/DashboardLayout';
import Section from '../components/Section';
import Loader from '../components/Loader';
import DisplayModal from '../components/DisplayModal';
import UserCreateSchool from '../components/UserCreateSchool';
import UserCreateCourse from '../components/UserCreateCourse';
import UserCreateCourseMembership from '../components/UserCreateCourseMembership';

import { viewAdminship, viewCourseMembership, isApiErrorCode } from '../utils/utils';

interface CourseEnrolledCardProps {
  courseName: string,
};

function CourseEnrolledCard(props: CourseEnrolledCardProps) {
  return (
    <Card className="h-100" style={{ width: '15rem' }}>
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
  courseName: string,
};

function CourseTaughtCard(props: CourseTaughtProps) {
  return (
    <Card className="h-100" style={{ width: '15rem' }}>
      <Card.Body>
        <Card.Title>{props.courseName}</Card.Title>
        <a title="Go to school page" href="" style={{ float: 'left' }}>
          <ArrowForwardIos /></a>
        <a title="Manage school" href="" className="float-left">
          <MoreHoriz /></a>
      </Card.Body>
    </Card>
  )
}


type SchoolCardProps = {
  schoolName: string,
};

function SchoolCard(props: SchoolCardProps) {
  return (
    <Card className="h-100" style={{ width: '15rem' }}>
      <Card.Body>
        <Card.Title>{props.schoolName}</Card.Title>
        <a title="Go to school page" href="" style={{ float: 'left' }}>
          <ArrowForwardIos /></a>
        <a title="Manage school" href="" className="float-left">
          <MoreHoriz /></a>
      </Card.Body>
    </Card>
  )
}

type AddNewCardProps = {
  setShow: (a: boolean) => void,
};

function AddNewCard(props: AddNewCardProps) {
  return (
    <Card
      className="h-100"
      style={{ width: '15rem', borderStyle: 'dashed', borderWidth: "medium" }}
      onClick={() => props.setShow(true)}>
      <div className="h-100 w-100 d-flex">
        <Add className="mx-auto my-auto text-muted" fontSize="large" />
      </div>
    </Card>
  )
}

const loadAdminships = async (props: AsyncProps<Adminship[]>) => {
  const maybeAdminships = await viewAdminship({
    userId: props.apiKey.creator.userId,
    adminshipKind: "ADMIN",
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeAdminships)) {
    throw Error;
  } else {
    return maybeAdminships;
  }
}

const loadCourseMembershipsStudent = async (props: AsyncProps<CourseMembership[]>) => {
  const maybeCourseMemberships = await viewCourseMembership({
    userId: props.apiKey.creator.userId,
    courseMembershipKind: "STUDENT",
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeCourseMemberships)) {
    throw Error;
  } else {
    return maybeCourseMemberships;
  }
}

const loadCourseMembershipsInstructor = async (props: AsyncProps<CourseMembership[]>) => {
  const maybeCourseMemberships = await viewCourseMembership({
    userId: props.apiKey.creator.userId,
    courseMembershipKind: "INSTRUCTOR",
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeCourseMemberships)) {
    throw Error;
  } else {
    return maybeCourseMemberships;
  }
}

function Dashboard(props: AuthenticatedComponentProps) {

  const [showNewSchoolModal, setShowNewSchoolModal] = React.useState(false);
  const [showNewCourseModal, setShowNewCourseModal] = React.useState(false);
  const [showNewCourseMembershipModal, setShowNewCourseMembershipModal] = React.useState(false);

  return (
    <DashboardLayout {...props}>
      <Container fluid className="py-4 px-4">
        <Section id="schools_i_administer" name="Schools I Administer">
          <Async promiseFn={loadAdminships} apiKey={props.apiKey}>
            {({ reload }) => <>
              <Async.Pending><Loader /></Async.Pending>
              <Async.Rejected>
                <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
              </Async.Rejected>
              <Async.Fulfilled<Adminship[]>>{data => <>
                <div className="d-flex flex-wrap">
                  {data.map((a: Adminship) =>
                    <div className="my-3 mx-3">
                      <SchoolCard schoolName={a.school.name} />
                    </div>
                  )}
                  <div className="my-3 mx-3">
                    <AddNewCard setShow={setShowNewSchoolModal} />
                    <DisplayModal
                      title="Create New School"
                      show={showNewSchoolModal}
                      setShow={setShowNewSchoolModal}
                    >
                      <UserCreateSchool apiKey={props.apiKey}
                        postSubmit={() => {
                          setShowNewSchoolModal(false);
                          reload();
                        }}
                      />
                    </DisplayModal>
                  </div>
                </div>
              </>}
              </Async.Fulfilled>
            </>}
          </Async>
        </Section>
        <Section id="courses_i_teach" name="Courses I Teach">
          <Async promiseFn={loadCourseMembershipsInstructor} apiKey={props.apiKey}>
            {({ reload }) => <>
              <Async.Pending><Loader /></Async.Pending>
              <Async.Rejected>
                <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
              </Async.Rejected>
              <Async.Fulfilled<CourseMembership[]>>{data => <>
                <div className="d-flex flex-wrap">
                  {data.map((a: CourseMembership) =>
                    <div className="my-3 mx-3">
                      <CourseTaughtCard courseName={a.course.name} />
                    </div>
                  )}
                  <div className="my-3 mx-3">
                    <AddNewCard setShow={setShowNewCourseModal} />
                    <DisplayModal
                      title="Create New Course"
                      show={showNewCourseModal}
                      setShow={setShowNewCourseModal}
                    >
                      <UserCreateCourse apiKey={props.apiKey}
                        postSubmit={() => {
                          setShowNewCourseModal(false);
                          reload();
                        }}
                      />
                    </DisplayModal>
                  </div>
                </div>
              </>}
              </Async.Fulfilled>
            </>}
          </Async>
        </Section>
        <Section id="courses_i_take" name="Courses I Take">
          <Async promiseFn={loadCourseMembershipsStudent} apiKey={props.apiKey}>
            {({ reload }) => <>
              <Async.Pending><Loader /></Async.Pending>
              <Async.Rejected>
                <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
              </Async.Rejected>
              <Async.Fulfilled<CourseMembership[]>>{data => <>
                <div className="d-flex flex-wrap">
                  {data.map((a: CourseMembership) =>
                    <div className="my-3 mx-3">
                      <CourseEnrolledCard courseName={a.course.name} />
                    </div>
                  )}
                  <div className="my-3 mx-3">
                    <AddNewCard setShow={setShowNewCourseMembershipModal} />
                    <DisplayModal
                      title="Create New CourseMembership"
                      show={showNewCourseMembershipModal}
                      setShow={setShowNewCourseMembershipModal}
                    >
                    </DisplayModal>
                  </div>
                </div>
              </>}
              </Async.Fulfilled>
            </>}
          </Async>
        </Section>
      </Container>
    </DashboardLayout>
  );
};

export default Dashboard;
