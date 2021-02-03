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
import UserCreateCourseMembership from '../components/UserCreateCourseMembership';
import { viewSubscription, viewAdminship, viewSchoolData, viewCourseData, viewCourseMembership, isApiErrorCode } from '../utils/utils';

type ResourceCardProps = {
  title: string,
  subtitle: string,
  text: string,
  href: string
}

function ResourceCard(props: ResourceCardProps) {
  return (
    <a className="text-dark float-right" href={props.href}>
      <Card className="h-100" style={{ width: '15rem' }}>
        <Card.Body>
          <Card.Title>{props.title}</Card.Title>
          <Card.Subtitle className="text-muted">{props.subtitle}</Card.Subtitle>
          <Card.Text>{props.text}</Card.Text>
        </Card.Body>
      </Card>
    </a>
  )
}

const loadCourseData = async (props: AsyncProps<CourseData>) => {
  const maybeCourseData = await viewCourseData({
    courseId: props.courseId,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  });

  if (isApiErrorCode(maybeCourseData)) {
    throw Error;
  }
  // there's an invariant that there must always be one course data per valid course id
  return maybeCourseData[0];
}

const loadSchoolData = async (props: AsyncProps<SchoolData>) => {
  const maybeSchoolData = await viewSchoolData({
    schoolId: props.schoolId,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  });

  if (isApiErrorCode(maybeSchoolData)) {
    throw Error;
  }
  // there's an invariant that there must always be one school data per valid school id
  return maybeSchoolData[0];
}


type SchoolCardProps = {
  school: School,
  apiKey: ApiKey,
}


function SchoolCard(props: SchoolCardProps) {
  return <Async promiseFn={loadSchoolData}
    apiKey={props.apiKey}
    schoolId={props.school.schoolId}>
    {_ => <>
      <Async.Pending><Loader /></Async.Pending>
      <Async.Rejected>
        <span className="text-danger">An unknown error has occured.</span>
      </Async.Rejected>
      <Async.Fulfilled<SchoolData>>{schoolData =>
        <ResourceCard
          title={schoolData.name}
          subtitle=""
          text={schoolData.description}
          href={`/admin_manage_school?schoolId=${props.school.schoolId}`}
        />
      }
      </Async.Fulfilled>
    </>}
  </Async>
}

type CourseCardProps = {
  course: Course,
  role: CourseMembershipKind,
  apiKey: ApiKey,
};

function CourseCard(props: CourseCardProps) {
  return <Async promiseFn={loadCourseData}
    apiKey={props.apiKey}
    courseId={props.course.courseId}>
    {_ => <>
      <Async.Pending><Loader /></Async.Pending>
      <Async.Rejected>
        <span className="text-danger">An unknown error has occured.</span>
      </Async.Rejected>
      <Async.Fulfilled<CourseData>>{courseData =>
        <ResourceCard
          title={courseData.name}
          subtitle={props.role}
          text={courseData.description}
          href={props.role === "INSTRUCTOR"
            ? `/instructor_manage_course?courseId=${props.course.courseId}`
            : `/student_manage_course?courseId=${props.course.courseId}`}
        />
      }
      </Async.Fulfilled>
    </>}
  </Async>
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
  adminships: Adminship[],
  subscription: Subscription | null,
}

const loadDashboardData = async (props: AsyncProps<DashboardData>) => {
  const maybeSubscriptions = await viewSubscription({
    creatorUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  const maybeAdminships = await viewAdminship({
    userId: props.apiKey.creator.userId,
    adminshipKind: "ADMIN",
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeSubscriptions)) {
    throw Error;
  }

  if (isApiErrorCode(maybeAdminships)) {
    throw Error;
  }

  return {
    adminships: maybeAdminships,
    subscription: maybeSubscriptions.length === 0 ? null : maybeSubscriptions[0]
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

              {ddata.adminships.length === 0 && ddata.subscription == null
                ? <> </>
                : <Section id="my_schools" name="My Schools">
                  <div className="d-flex flex-wrap">
                    {ddata.adminships.map((a: Adminship) =>
                      <div className="my-3 mx-3">
                        <SchoolCard school={a.school} apiKey={props.apiKey} />
                      </div>
                    )}
                    {ddata.subscription === null
                      ? <> </>
                      : <div className="my-3 mx-3">
                        <AddNewCard setShow={setShowNewSchoolModal} />
                        <DisplayModal
                          title="Create New School"
                          show={showNewSchoolModal}
                          onClose={() => setShowNewSchoolModal(false)}
                        >
                          <UserCreateSchool apiKey={props.apiKey}
                            postSubmit={() => {
                              setShowNewSchoolModal(false);
                              reloadDashboardData();
                            }}
                          />
                        </DisplayModal>
                      </div>
                    }
                  </div>
                </Section>
              }

              <Async promiseFn={loadCourseMemberships} apiKey={props.apiKey}>
                {({ reload: reloadCourseMemberships }) => <>
                  <Async.Pending><Loader /></Async.Pending>
                  <Async.Rejected>
                    <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
                  </Async.Rejected>
                  <Async.Fulfilled<CourseMembership[]>>{cms => <>
                    <Section id="my_courses" name="My Courses">
                      <div className="d-flex flex-wrap">
                        {cms
                          .filter(cm => cm.courseMembershipKind !== "CANCEL")
                          .map((a: CourseMembership) =>
                            <CourseCard course={a.course} role={a.courseMembershipKind} apiKey={props.apiKey} />
                          )}
                        <div className="my-3 mx-3">
                          <AddNewCard setShow={setShowNewCourseModal} />
                          <DisplayModal
                            title="Add Course"
                            show={showNewCourseModal}
                            onClose={() => setShowNewCourseModal(false)}
                          >
                            <Tabs>
                              {ddata.subscription === null
                                ? <> </>
                                : <Tab title="Create Course" eventKey="course_create" className="py-4">
                                  <UserCreateCourse apiKey={props.apiKey}
                                    postSubmit={() => {
                                      setShowNewCourseModal(false);
                                      reloadCourseMemberships();
                                    }}
                                  />
                                </Tab>
                              }
                              <Tab title="Join Course" eventKey="course_join" className="py-4">
                                <UserCreateCourseMembership apiKey={props.apiKey}
                                  postSubmit={() => {
                                    setShowNewCourseModal(false);
                                    reloadCourseMemberships();
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
            </>}
            </Async.Fulfilled>
          </>}
        </Async>
      </Container>
    </DashboardLayout>
  );
};

export default Dashboard;
