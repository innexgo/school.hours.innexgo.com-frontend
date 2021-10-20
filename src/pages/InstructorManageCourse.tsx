import { Container } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import InstructorManageCourseMembershipTable from '../components/InstructorManageCourseMembershipTable';
import InstructorManageCourseKeyTable from '../components/InstructorManageCourseKeyTable';
import InstructorManageCourseData from '../components/InstructorManageCourseData';
import { Loader, WidgetWrapper } from '@innexgo/common-react-components';
import ErrorMessage from '../components/ErrorMessage';
import update from 'immutability-helper';

import { AuthenticatedComponentProps } from '@innexgo/auth-react-components';

import { unwrap, getFirstOr } from '@innexgo/frontend-common';
import { CourseData, CourseKeyData, CourseMembership, courseDataView, courseMembershipView, courseKeyDataView } from '../utils/utils';

import { Async, AsyncProps } from 'react-async';

type ManageCourseData = {
  courseData: CourseData,
  courseKeyData: CourseKeyData[],
  courseMemberships: CourseMembership[]
}

async function loadManageCourseData(props: AsyncProps<ManageCourseData>) {
  const courseData = await courseDataView({
    courseId: [props.courseId],
    apiKey: props.apiKey.key,
    onlyRecent: true,
  })
    .then(unwrap)
    .then(x => getFirstOr(x, "NOT_FOUND"))
    .then(unwrap)

  const courseKeyData = await courseKeyDataView({
    courseId: [props.courseId],
    active: true,
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);

  const courseMemberships = await courseMembershipView({
    courseId: [props.courseId],
    apiKey: props.apiKey.key,
    onlyRecent: true,
  })
    .then(unwrap);

  return {
    courseData,
    courseKeyData,
    courseMemberships,
  };
}

function InstructorManageCourse(props: AuthenticatedComponentProps) {
  const courseId = parseInt(new URLSearchParams(window.location.search).get("courseId") ?? "");
  return (
    <DashboardLayout {...props}>
      <Container fluid className="py-4 px-4">
        <Async promiseFn={loadManageCourseData} apiKey={props.apiKey} courseId={courseId}>{
          ({ setData }) => <>
            <Async.Pending><Loader /></Async.Pending>
            <Async.Rejected>{e => <ErrorMessage error={e} />}</Async.Rejected>
            <Async.Fulfilled<ManageCourseData>>{data => <>
              <div className="mx-3 my-3">
                <WidgetWrapper title="Course Data">
                  <span>Shows basic information about this course.</span>
                  <InstructorManageCourseData
                    courseData={data.courseData}
                    setCourseData={courseData => setData(update(data, { courseData: { $set: courseData } }))}
                    apiKey={props.apiKey}
                  />
                </WidgetWrapper>
              </div>

              <div className="mx-3 my-3">
                <WidgetWrapper title="Current Instructors">
                  <span>Shows the current instructors of this course.</span>
                  <InstructorManageCourseMembershipTable courseId={courseId} apiKey={props.apiKey} courseMembershipKind="INSTRUCTOR" />
                </WidgetWrapper>
              </div>

              <div className="mx-3 my-3">
                <WidgetWrapper title="Current Students">
                  <span>Shows the current students in this course.</span>
                  <InstructorManageCourseMembershipTable courseId={courseId} apiKey={props.apiKey} courseMembershipKind="STUDENT" />
                </WidgetWrapper>
              </div>

              <div className="mx-3 my-3">
                <WidgetWrapper title="Active Course Keys">
                  <span>Shows the currently active course keys.</span>
                  <InstructorManageCourseKeyTable
                    courseKeyData={data.courseKeyData}
                    setCourseKeyData={courseKeyData => setData(update(data, { courseKeyData: { $set: courseKeyData } }))}
                    courseId={courseId}
                    apiKey={props.apiKey}
                    addable
                  />
                </WidgetWrapper>
              </div>
            </>}
            </Async.Fulfilled>
          </>}
        </Async>
      </Container>
    </DashboardLayout>
  )
}

export default InstructorManageCourse
