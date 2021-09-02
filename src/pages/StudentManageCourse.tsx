import { Container, Popover } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import StudentManageCourseData from '../components/StudentManageCourseData';
import StudentManageCourseMemberships from '../components/StudentManageCourseMemberships'
import {WidgetWrapper} from '@innexgo/common-react-components';

import {AuthenticatedComponentProps} from '@innexgo/auth-react-components';

function StudentManageCourse(props: AuthenticatedComponentProps) {
  const courseId = parseInt(new URLSearchParams(window.location.search).get("courseId") ?? "");
  return (
    <DashboardLayout {...props}>
      <Container fluid className="py-4 px-4">
        <div className="mx-3 my-3">
          <WidgetWrapper title="Course Data">
            <Popover id="information-tooltip"> Shows basic information about this course. </Popover>
            <StudentManageCourseData courseId={courseId} apiKey={props.apiKey} />
          </WidgetWrapper>
        </div>

        <div className="mx-3 my-3">
          <WidgetWrapper title="Current Instructors">
            <Popover id="information-tooltip"> Shows the current instructors of this course.</Popover>
            <StudentManageCourseMemberships courseId={courseId} apiKey={props.apiKey} courseMembershipKind="INSTRUCTOR" />
          </WidgetWrapper>
        </div>
      </Container>
    </DashboardLayout>
  )
}

export default StudentManageCourse
