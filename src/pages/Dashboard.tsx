import React from 'react'
import { Table, Button, Container, Card, Form, Tabs, Tab } from 'react-bootstrap';
import { Add } from '@material-ui/icons'
import { Async, AsyncProps } from 'react-async';

import DashboardLayout from '../components/DashboardLayout';
import Section from '../components/Section';
import Loader from '../components/Loader';
import DisplayModal from '../components/DisplayModal';
import { ViewUser, } from '../components/ViewData';
import UserCreateSchool from '../components/UserCreateSchool';
import UserCreateAdminshipRequest from '../components/UserCreateAdminshipRequest';
import UserCreateCourse from '../components/UserCreateCourse';
import CreateAdminship from '../components/CreateAdminship';
import UserCreateCourseMembership from '../components/UserCreateCourseMembership';
import { subscriptionView, schoolDataView, courseDataView, } from '../utils/utils';

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
  subscription: Subscription | null,
  schoolData: SchoolData[],
  adminshipRequests: AdminshipRequest[],
  adminshipRequestResponses: AdminshipRequestResponse[],
  instructorCourseData: CourseData[],
  studentCourseData: CourseData[],
}

const loadDashboardData = async (props: AsyncProps<DashboardData>) => {
  const maybeSubscriptions = await subscriptionView({
    creatorUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    subscriptionKind: "VALID",
    apiKey: props.apiKey.key
  });

  const maybeSchoolData = await schoolDataView({
    recentAdminUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  const maybeAdminshipRequests = await viewAdminshipRequest({
    creatorUserId: props.apiKey.creator.userId,
    responded: false,
    apiKey: props.apiKey.key
  });

  const maybeAdminshipRequestResponses = await viewAdminshipRequestResponse({
    requesterUserId: props.apiKey.creator.userId,
    responded: false,
    apiKey: props.apiKey.key
  });


  const maybeInstructorCourseData = await courseDataView({
    recentInstructorUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  const maybeStudentCourseData = await courseDataView({
    recentStudentUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    apiKey: props.apiKey.key
  });


  if (
    isErr(maybeSubscriptions) ||
    isErr(maybeSchoolData) ||
    isErr(maybeAdminshipRequests) ||
    isErr(maybeAdminshipRequestResponses) ||
    isErr(maybeInstructorCourseData) ||
    isErr(maybeStudentCourseData)
  ) {
    throw Error;
  }

  return {
    subscription: maybeSubscriptions.length === 0 ? null : maybeSubscriptions[0],
    schoolData: maybeSchoolData,
    adminshipRequests: maybeAdminshipRequests,
    adminshipRequestResponses: maybeAdminshipRequestResponses,
    instructorCourseData: maybeInstructorCourseData,
    studentCourseData: maybeStudentCourseData,
  }
}

const loadSchoolData = async (props: AsyncProps<SchoolData>) => {
  const maybeSchoolData = await schoolDataView({
    schoolId: props.schoolId,
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  if (isErr(maybeSchoolData) || maybeSchoolData.length === 0) {
    throw Error;
  } else {
    return maybeSchoolData[0];
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
                ddata.subscription === null &&
                  ddata.schoolData.length === 0 &&
                  ddata.adminshipRequests.length === 0 &&
                  ddata.adminshipRequestResponses.length === 0
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
                      {ddata.adminshipRequestResponses
                        .filter(arr => showHiddenSchools || arr.accepted)
                        .map(arr =>
                          <div className="my-3 mx-3">
                            <AdminshipRequestResponseCard
                              adminshipRequestResponse={arr}
                              apiKey={props.apiKey}
                              postSubmit={reloadDashboardData}
                            />
                          </div>
                        )}
                      {ddata.adminshipRequests
                        .map(ar =>
                          <div className="my-3 mx-3">
                            <AdminshipRequestCard
                              adminshipRequest={ar}
                              apiKey={props.apiKey}
                            />
                          </div>
                        )}
                      {ddata.subscription === null
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
                                <UserCreateAdminshipRequest
                                  hiddenSchoolIds={[
                                    ...ddata.adminshipRequests.map(ar => ar.school.schoolId),
                                    ...ddata.adminshipRequestResponses
                                      .filter(arr => arr.accepted)
                                      .map(arr => arr.adminshipRequest.school.schoolId),
                                    ...ddata.schoolData.map(sd => sd.school.schoolId),
                                  ]}
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
