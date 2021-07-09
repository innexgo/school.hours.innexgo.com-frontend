import { Container, Popover } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import InstructorManageCourseMemberships from '../components/InstructorManageCourseMemberships';
import InstructorManageCourseKeys from '../components/InstructorManageCourseKeys';
import InstructorManageCourseData from '../components/InstructorManageCourseData';
import UtilityWrapper from '../components/UtilityWrapper';

import {AuthenticatedComponentProps} from '@innexgo/frontend-auth-api';

function InstructorManageCourse(props: AuthenticatedComponentProps) {
  const courseId = parseInt(new URLSearchParams(window.location.search).get("courseId") ?? "");
  return (
    <DashboardLayout {...props}>
      <Container fluid className="py-4 px-4">
        <div className="mx-3 my-3">
          <UtilityWrapper title="Course Data">
            <Popover id="information-tooltip"> Shows basic information about this course. </Popover>
            <InstructorManageCourseData courseId={courseId} apiKey={props.apiKey} />
          </UtilityWrapper>
        </div>

        <div className="mx-3 my-3">
          <UtilityWrapper title="Current Instructors">
            <Popover id="information-tooltip"> Shows the current instructors of this course.</Popover>
            <InstructorManageCourseMemberships courseId={courseId} apiKey={props.apiKey} courseMembershipKind="INSTRUCTOR" />
          </UtilityWrapper>
        </div>

        <div className="mx-3 my-3">
          <UtilityWrapper title="Current Students">
            <Popover id="information-tooltip"> Shows the current students in this course.</Popover>
            <InstructorManageCourseMemberships courseId={courseId} apiKey={props.apiKey} courseMembershipKind="STUDENT" />
          </UtilityWrapper>
        </div>

        <div className="mx-3 my-3">
          <UtilityWrapper title="Active Course Keys">
            <Popover id="information-tooltip"> Shows the currently active course keys.</Popover>
            <InstructorManageCourseKeys courseId={courseId} apiKey={props.apiKey} />
          </UtilityWrapper>
        </div>
      </Container>
    </DashboardLayout>
  )
}

export default InstructorManageCourse
