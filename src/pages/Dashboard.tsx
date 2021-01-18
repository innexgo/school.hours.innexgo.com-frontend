import React from 'react'
import { Container, Card, Form, Tabs, Tab } from 'react-bootstrap';
import { BarChart, Settings, Add } from '@material-ui/icons'
import { Async, AsyncProps } from 'react-async';

import DashboardLayout from '../components/DashboardLayout';
import Section from '../components/Section';
import Loader from '../components/Loader';
import DisplayModal from '../components/DisplayModal';
import UserCreateSchool from '../components/UserCreateSchool';
import UserCreateCourse from '../components/UserCreateCourse';
import UserCreateCourseMembership from '../components/UserCreateCourseMembership';
import { viewAdminship, viewCourseMembership, isApiErrorCode } from '../utils/utils';

type ResourceCardProps = {
  title: string,
  text: string,
  href: string
}

function ResourceCard(props: ResourceCardProps) {
  return (
    <a className="text-dark float-right" href={props.href}>
      <Card className="h-100" style={{ width: '15rem' }}>
        <Card.Body>
          <Card.Title>{props.title}</Card.Title>
          <Card.Text>{props.text}</Card.Text>
        </Card.Body>
      </Card>
    </a>
  )
}


type AddNewCardProps = {
  setShow: (a: boolean) => void,
};

function AddNewCard(props: AddNewCardProps) {
  return (
    <button
      className="h-100"
      style={{ width: '15rem', borderStyle: 'dashed', borderWidth: "medium" }}
      onClick={() => props.setShow(true)}>
      <div className="h-100 w-100 d-flex">
        <Add className="mx-auto my-auto text-muted" fontSize="large" />
      </div>
    </button>
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

const loadCourseMemberships = async (props: AsyncProps<CourseMembership[]>) => {
  const maybeCourseMemberships = await viewCourseMembership({
    userId: props.apiKey.creator.userId,
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
                      <ResourceCard
                        title={a.school.name}
                        text={a.school.abbreviation}
                        href={`/admin_manage_school?schoolId=${a.school.schoolId}`}
                      />
                    </div>
                  )}
                  <div className="my-3 mx-3">
                    <AddNewCard setShow={setShowNewSchoolModal} />
                    <DisplayModal
                      title="Create New School"
                      show={showNewSchoolModal}
                      onClose={() => setShowNewSchoolModal(false)}
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
        <Async promiseFn={loadCourseMemberships} apiKey={props.apiKey}>
          {({ reload }) => <>
            <Async.Pending><Loader /></Async.Pending>
            <Async.Rejected>
              <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
            </Async.Rejected>
            <Async.Fulfilled<CourseMembership[]>>{cms => <>
              <Section id="courses_i_teach" name="Courses I Teach">
                <div className="d-flex flex-wrap">
                  {cms
                    .filter(cm => cm.courseMembershipKind === "INSTRUCTOR")
                    .map((a: CourseMembership) =>
                      <div className="my-3 mx-3">
                        <ResourceCard
                          title={a.course.name}
                          text={a.course.description}
                          href={`/instructor_manage_course?courseId=${a.course.courseId}`}
                        />
                      </div>
                    )}
                  <div className="my-3 mx-3">
                    <AddNewCard setShow={setShowNewCourseModal} />
                    <DisplayModal
                      title="Add Course"
                      show={showNewCourseModal}
                      onClose={() => setShowNewCourseModal(false)}
                    >
                      <Tabs >
                        <Tab title="Create Course" eventKey="course_create" className="py-4">
                          <UserCreateCourse apiKey={props.apiKey}
                            postSubmit={() => {
                              setShowNewCourseModal(false);
                              reload();
                            }}
                          />
                        </Tab>
                        <Tab title="Join Course" eventKey="course_join" className="py-4">
                          <UserCreateCourseMembership apiKey={props.apiKey}
                            postSubmit={() => {
                              setShowNewCourseModal(false);
                              reload();
                            }}
                          />
                        </Tab>
                      </Tabs>
                    </DisplayModal>
                  </div>
                </div>
              </Section>
              <Section id="courses_i_take" name="Courses I Take">
                <div className="d-flex flex-wrap">
                  {cms
                    .filter(cm => cm.courseMembershipKind === "STUDENT")
                    .map((a: CourseMembership) =>
                      <div className="my-3 mx-3">
                        <ResourceCard
                          title={a.course.name}
                          text={a.course.description}
                          href={`/student_manage_course?courseId=${a.course.courseId}`}
                        />
                      </div>
                    )}
                  <div className="my-3 mx-3">
                    <AddNewCard setShow={setShowNewCourseMembershipModal} />
                    <DisplayModal
                      title="Join Course"
                      show={showNewCourseMembershipModal}
                      onClose={() => setShowNewCourseMembershipModal(false)}
                    >
                      <UserCreateCourseMembership apiKey={props.apiKey}
                        postSubmit={() => {
                          setShowNewCourseMembershipModal(false);
                          reload();
                        }}
                      />
                    </DisplayModal>
                  </div>
                </div>
              </Section>
            </>}
            </Async.Fulfilled>
          </>}
        </Async>

      </Container>
    </DashboardLayout>
  );
};

export default Dashboard;
