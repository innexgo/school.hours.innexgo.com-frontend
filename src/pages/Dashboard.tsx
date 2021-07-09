import React from 'react'
import { Container, Card, Form, Tabs, Tab } from 'react-bootstrap';
import { Add } from '@material-ui/icons'
import { Async, AsyncProps } from 'react-async';

import DashboardLayout from '../components/DashboardLayout';
import Section from '../components/Section';
import Loader from '../components/Loader';
import DisplayModal from '../components/DisplayModal';
import UserCreateSchool from '../components/UserCreateSchool';
import UserCreateCourse from '../components/UserCreateCourse';
import CreateAdminship from '../components/CreateAdminship';
import UserCreateCourseMembership from '../components/UserCreateCourseMembership';
import { subscriptionView, schoolDataView, courseDataView, adminshipView, courseMembershipView, SchoolData, CourseData, } from '../utils/utils';
import { AuthenticatedComponentProps } from '@innexgo/frontend-auth-api';
import { unwrap, } from '@innexgo/frontend-common';

type ResourceCardProps = {
  title: string,
  subtitle: string,
  active: boolean,
  text: string,
  href: string
}

function ResourceCard(props: ResourceCardProps) {
  return (
    <a className="text-dark float-right" href={props.href}>
      <Card className="h-100" style={{ width: '15rem' }}>
        <Card.Body>
          <Card.Title>{props.title}</Card.Title>
          <Card.Subtitle className="text-muted">{props.subtitle}{props.active ? "" : " (ARCHIVED)"}</Card.Subtitle>
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

type DashboardData = {
  subscribed: boolean,
  schoolData: SchoolData[],
  instructorCourseData: CourseData[],
  studentCourseData: CourseData[],
}

const loadDashboardData = async (props: AsyncProps<DashboardData>) => {
  const subscriptions = await subscriptionView({
    creatorUserId: [props.apiKey.creator.userId],
    onlyRecent: true,
    subscriptionKind: ["VALID"],
    apiKey: props.apiKey.key
  })
    .then(unwrap);

  const adminships = await adminshipView({
    userId: [props.apiKey.creator.userId],
    onlyRecent: true,
    adminshipKind: ["ADMIN"],
    apiKey: props.apiKey.key
  })
    .then(unwrap);


  const schoolData = await schoolDataView({
    schoolId: adminships.map(a => a.school.schoolId),
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);

  const courseMemberships = await courseMembershipView({
    userId: [props.apiKey.creator.userId],
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);

  const instructorCourseData = await courseDataView({
    courseId: courseMemberships.filter(cm => cm.courseMembershipKind == "INSTRUCTOR").map(cm => cm.course.courseId),
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);


  const studentCourseData = await courseDataView({
    courseId: courseMemberships.filter(cm => cm.courseMembershipKind == "STUDENT").map(cm => cm.course.courseId),
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);

  return {
    subscribed: subscriptions.length > 0,
    schoolData,
    instructorCourseData,
    studentCourseData,
  }
}

function Dashboard(props: AuthenticatedComponentProps) {

  // which modal to display
  const [showNewAdminshipModal, setShowNewAdminshipModal] = React.useState(false);
  const [showNewCourseModal, setShowNewCourseModal] = React.useState(false);

  const [showHiddenSchools, setShowHiddenSchools] = React.useState(false);
  const [showHiddenCourses, setShowHiddenCourses] = React.useState(false);

  return (
    <DashboardLayout {...props}>
      <Container fluid className="py-4 px-4">
        <Async promiseFn={loadDashboardData} apiKey={props.apiKey}>
          {({ reload: reloadDashboardData }) => <>
            <Async.Pending><Loader /></Async.Pending>
            <Async.Rejected>
              <Form.Text className="text-danger">An unknown error has occured while loading data.</Form.Text>
            </Async.Rejected>
            <Async.Fulfilled<DashboardData>>{ddata => <>
              {
                !(ddata.subscribed || ddata.schoolData.length > 0)
                  ? <> </>
                  : <Section id="my_schools" name="My Schools">
                    <Form.Check
                      checked={showHiddenSchools}
                      onChange={_ => setShowHiddenSchools(!showHiddenSchools)}
                      label="Show Hidden Schools"
                    />
                    <div className="d-flex flex-wrap">
                      {ddata.schoolData
                        .filter(sd => showHiddenSchools || sd.active)
                        .map(sd =>
                          <div className="my-3 mx-3">
                            <ResourceCard
                              title={sd.name}
                              subtitle="ADMIN"
                              active={sd.active}
                              text={""}
                              href={`/admin_manage_school?schoolId=${sd.school.schoolId}`}
                            />
                          </div>
                        )}

                      {!ddata.subscribed
                        ? <> </>
                        : <div className="my-3 mx-3">
                          <AddNewCard setShow={setShowNewAdminshipModal} />
                          <DisplayModal
                            title="Create New School"
                            show={showNewAdminshipModal}
                            onClose={() => setShowNewAdminshipModal(false)}
                          >
                            <Tabs>
                              <Tab title="Create School" eventKey="school_create" className="py-4">
                                <UserCreateSchool apiKey={props.apiKey}
                                  postSubmit={() => {
                                    setShowNewAdminshipModal(false);
                                    reloadDashboardData();
                                  }}
                                />
                              </Tab>
                              <Tab title="Join School" eventKey="school_join" className="py-4">
                                <CreateAdminship
                                  apiKey={props.apiKey}
                                  postSubmit={() => {
                                    setShowNewAdminshipModal(false);
                                    reloadDashboardData();
                                  }}
                                />
                              </Tab>
                            </Tabs>
                          </DisplayModal>
                        </div>
                      }
                    </div>
                  </Section>
              }
              <Section id="my_courses" name="My Courses">
                <Form.Check
                  checked={showHiddenCourses}
                  onChange={_ => setShowHiddenCourses(!showHiddenCourses)}
                  label="Show Hidden Courses"
                />
                <div className="d-flex flex-wrap">
                  {ddata.instructorCourseData
                    .filter(cd => showHiddenCourses || cd.active)
                    .map(cd =>
                      <div className="my-3 mx-3">
                        <ResourceCard
                          title={cd.name}
                          subtitle={"INSTRUCTOR"}
                          active={cd.active}
                          text={cd.description}
                          href={`/instructor_manage_course?courseId=${cd.course.courseId}`}
                        />
                      </div>
                    )}
                  {ddata.studentCourseData
                    .filter(cd => showHiddenCourses || cd.active)
                    .map(cd =>
                      <div className="my-3 mx-3">
                        <ResourceCard
                          title={cd.name}
                          subtitle={"STUDENT"}
                          active={cd.active}
                          text={cd.description}
                          href={`/student_manage_course?courseId=${cd.course.courseId}`}
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
                      <Tabs>
                        {ddata.schoolData.length === 0
                          ? <> </>
                          : <Tab title="Create Course" eventKey="course_create" className="py-4">
                            <UserCreateCourse apiKey={props.apiKey}
                              postSubmit={() => {
                                setShowNewCourseModal(false);
                                reloadDashboardData();
                              }}
                            />
                          </Tab>
                        }
                        <Tab title="Join Course" eventKey="course_join" className="py-4">
                          <UserCreateCourseMembership apiKey={props.apiKey}
                            postSubmit={() => {
                              setShowNewCourseModal(false);
                              reloadDashboardData();
                            }}
                          />
                        </Tab>
                      </Tabs>
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
