import { Container, Popover } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import StudentManageCourseData from '../components/StudentManageCourseData';
import StudentManageCourseMemberships from '../components/StudentManageCourseMemberships'
import UtilityWrapper from '../components/UtilityWrapper';

import {AuthenticatedComponentProps} from '@innexgo/frontend-auth-api';

function StudentManageCourse(props: AuthenticatedComponentProps) {
  const courseId = parseInt(new URLSearchParams(window.location.search).get("courseId") ?? "");
  return (
    <DashboardLayout {...props}>
      <Container fluid className="py-4 px-4">
        <div className="mx-3 my-3">
          <UtilityWrapper title="Course Data">
            <Popover id="information-tooltip"> Shows basic information about this course. </Popover>
            <StudentManageCourseData courseId={courseId} apiKey={props.apiKey} />
          </UtilityWrapper>
        </div>

        <div className="mx-3 my-3">
          <UtilityWrapper title="Current Instructors">
            <Popover id="information-tooltip"> Shows the current instructors of this course.</Popover>
            <StudentManageCourseMemberships courseId={courseId} apiKey={props.apiKey} courseMembershipKind="INSTRUCTOR" />
          </UtilityWrapper>
        </div>

   
      </Container>
    </DashboardLayout>
  )
}

export default StudentManageCourse
