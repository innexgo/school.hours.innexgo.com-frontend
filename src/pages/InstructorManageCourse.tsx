import { Container } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import InstructorManageCourseMemberships from '../components/InstructorManageCourseMemberships';
import InstructorManageCourseKeys from '../components/InstructorManageCourseKeys';
import InstructorManageCourseData from '../components/InstructorManageCourseData';
import { WidgetWrapper } from '@innexgo/common-react-components';

import { AuthenticatedComponentProps } from '@innexgo/auth-react-components';

function InstructorManageCourse(props: AuthenticatedComponentProps) {
  const courseId = parseInt(new URLSearchParams(window.location.search).get("courseId") ?? "");
  return (
    <DashboardLayout {...props}>
      <Container fluid className="py-4 px-4">
        <div className="mx-3 my-3">
          <WidgetWrapper title="Course Data">
            <span>Shows basic information about this course.</span>
            <InstructorManageCourseData courseId={courseId} apiKey={props.apiKey} />
          </WidgetWrapper>
        </div>

        <div className="mx-3 my-3">
          <WidgetWrapper title="Current Instructors">
            <span>Shows the current instructors of this course.</span>
            <InstructorManageCourseMemberships courseId={courseId} apiKey={props.apiKey} courseMembershipKind="INSTRUCTOR" />
          </WidgetWrapper>
        </div>

        <div className="mx-3 my-3">
          <WidgetWrapper title="Current Students">
            <span>Shows the current students in this course.</span>
            <InstructorManageCourseMemberships courseId={courseId} apiKey={props.apiKey} courseMembershipKind="STUDENT" />
          </WidgetWrapper>
        </div>

        <div className="mx-3 my-3">
          <WidgetWrapper title="Active Course Keys">
            <span>Shows the currently active course keys.</span>
            <InstructorManageCourseKeys courseId={courseId} apiKey={props.apiKey} />
          </WidgetWrapper>
        </div>
      </Container>
    </DashboardLayout>
  )
}

export default InstructorManageCourse
