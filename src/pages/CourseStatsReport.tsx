import { Container, Popover } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';

import CourseViewStatsReport from '../components/CourseViewStatsReport';
import {WidgetWrapper }from '@innexgo/common-react-components';

import {AuthenticatedComponentProps} from '@innexgo/auth-react-components';


function CourseStatsReport(props: AuthenticatedComponentProps) {
  const courseId = parseInt(new URLSearchParams(window.location.search).get("courseId") ?? "");
  return (
    <DashboardLayout {...props}>
      <Container fluid className="py-4 px-4">
      <div className="mx-3 my-3">
          <WidgetWrapper title="Course Data">
            <Popover id="information-tooltip"> 
            The total tells you the total times an appointment has been set up within the past 6 months.
            P represents how many times present to the appointed meetings.
            A represents how many times absent to the appointed meetings.
             </Popover>
            <CourseViewStatsReport courseId={courseId} apiKey={props.apiKey} />
          </WidgetWrapper>
        </div>
      </Container>
    </DashboardLayout>
  )
}

export default CourseStatsReport;
