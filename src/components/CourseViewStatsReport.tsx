import { Button, Form, Table } from 'react-bootstrap';
import { ViewCourse, ViewUser, } from '../components/ViewData';

import { X as DeleteIcon, } from 'react-bootstrap-icons'
import { Formik, FormikHelpers, } from 'formik'

import format from "date-fns/format";

import { Async, AsyncProps } from 'react-async';
import { courseMembershipView, CourseMembership, Commitment, CourseData, commitmentView, courseDataView, } from '../utils/utils';

import { unwrap } from '@innexgo/frontend-common';
import { ApiKey} from '@innexgo/frontend-auth-api';

import {AuthenticatedComponentProps} from '@innexgo/auth-react-components';

/*
type CourseStatsReportData = {
  courseMemberships: CourseMembership[],
  unrespondedCommitments: Commitment[],
  courseData: CourseData,
}

type InternalCourseViewStatsReportProps = {
  // its critical that we pass the function as a prop, because if we define it inside this function, react-async will break
  loadMemberships: (fprops: AsyncProps<CourseStatsReportData>) => Promise<CourseStatsReportData>,
  courseId: number,
  apiKey: ApiKey,
}

function InternalCourseViewStatsReport(props: InternalCourseViewStatsReportProps) {

  return <>
    <Async promiseFn={props.loadMemberships} minStartTime={0}>
      {({ reload }) => <>
        <Async.Pending>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Async.Pending>
        <Async.Rejected>
          <Form.Text className="text-danger">An unknown error has occured. </Form.Text>
        </Async.Rejected>
        <Async.Fulfilled<CourseStatsReportData>>{data => <>
          <Table hover bordered>
            <thead>
              <th>COURSE: <ViewCourse courseData={data.courseData} apiKey={props.apiKey} expanded={false} /></th>
              <p></p>
            </thead>
          </Table>
          <Table hover bordered>
            <thead>
              <tr>
                <th>User</th>
                <th>Date Joined</th>
                <th># of Appointments</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Pending</th>
                <th>Last Attended</th>
              </tr>
            </thead>
            <tbody>
              {
                data.courseMemberships.length === 0
                  ? <tr><td colSpan={3} className="text-center">No current members.</td></tr>
                  : data.courseMemberships.map((a: CourseMembership) => {
                    let scr = data.commitmentResponses.filter(cr => a.userId === cr.commitment.attendeeUserId);
                    let sc = data.unrespondedCommitments.filter(c => a.userId === c.attendeeUserId);
                    let presentCommitmentResponses = scr.filter(cr => cr.kind === "PRESENT");
                    return <tr>
                      <td><ViewUser userId={a.userId} apiKey={props.apiKey} expanded={false} /></td>
                      <td>{format(a.creationTime, "MMM do")}</td>
                      <td>{scr.length}</td>
                      <td>{presentCommitmentResponses.length}</td>
                      <td>{scr.filter(cr => cr.kind === "ABSENT").length}</td>
                      <td>{sc.length}</td>
                      <td>{presentCommitmentResponses.length === 0
                        ? "N/A"
                        : format(presentCommitmentResponses[presentCommitmentResponses.length - 1].creationTime, "MMM do")}</td>
                    </tr>
                  })}
            </tbody>
          </Table>
        </>}
        </Async.Fulfilled>
      </>}
    </Async>
  </>
}


// This is a wrapper to stop the infinte loop

type CourseViewStatsReportProps = {
  courseId: number,
  apiKey: ApiKey,
}

function CourseViewStatsReport(props: CourseViewStatsReportProps) {
  return <InternalCourseViewStatsReport
    courseId={props.courseId}
    apiKey={props.apiKey}
    loadMemberships={async (fprops: AsyncProps<CourseStatsReportData>) => {
      const courseMemberships = await courseMembershipView({
        courseMembershipKind: ["STUDENT"],
        courseId: [props.courseId],
        onlyRecent: true,
        apiKey: props.apiKey.key
      })
      .then(unwrap);
      const unrespondedCommitments  = await commitmentView({
        courseId: [props.courseId],
        responded: false,
        minStartTime: fprops.minStartTime,
        apiKey: props.apiKey.key
      })
      .then(unwrap);

      const commitmentResponses  = await commitmentResponseView({
        courseId: [props.courseId],
        minStartTime: fprops.minStartTime,
        apiKey: props.apiKey.key
      })
      .then(unwrap);

      const courseData = await courseDataView({
        courseId: [props.courseId],
        onlyRecent: true,
        apiKey: props.apiKey.key
      })
      .then(unwrap);

        return {
          courseMemberships,
          unrespondedCommitments,
          commitmentResponses,
          courseData: courseData[0],
        }
    }}
  />
}

*/

type CourseViewStatsReportProps = {
  courseId: number,
  apiKey: ApiKey,
}

function CourseViewStatsReport(props: CourseViewStatsReportProps ) {
    return <p>TODO</p>
}
export default CourseViewStatsReport;
