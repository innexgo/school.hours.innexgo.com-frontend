
import React from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import Loader from '../components/Loader';
import DisplayModal from '../components/DisplayModal';
import { ViewCommittmentResponse, ViewCourse, ViewUser, } from '../components/ViewData';

import { Delete, } from '@material-ui/icons'
import { Formik, FormikHelpers, } from 'formik'

import format from "date-fns/format";

import { Async, AsyncProps } from 'react-async';
import { viewCourseMembership, isApiErrorCode, viewCommittment, viewCommittmentResponse, viewCourseData, viewCourse } from '../utils/utils';
import { isPropsEqual } from '@fullcalendar/common';
import { userInfo } from 'os';
import { committmentResponseToEvent } from './ToCalendar';

type CourseStatsReportData = {
    courseMemberships: CourseMembership[],
    unrespondedCommittments: Committment[],
    committmentResponses: CommittmentResponse[],
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
                <Async.Pending><Loader /></Async.Pending>
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
                                    : data.courseMemberships.map((a: CourseMembership) =>{
                                        let scr = data.committmentResponses.filter(cr => a.user.userId === cr.committment.attendee.userId);
                                        let sc = data.unrespondedCommittments.filter(c => a.user.userId === c.attendee.userId);
                                        let presentCommittmentResponses = scr.filter(cr => cr.kind === "PRESENT");
                                        return <tr>
                                            <td><ViewUser user={a.user} apiKey={props.apiKey} expanded={false} /></td>
                                            <td>{format(a.creationTime, "MMM do")}</td>
                                            <td>{scr.length}</td>
                                            <td>{presentCommittmentResponses.length}</td>
                                            <td>{scr.filter(cr => cr.kind === "ABSENT").length}</td>
                                            <td>{sc.length}</td>
                                            <td>{presentCommittmentResponses.length === 0
                                            ?"N/A"
                                            :format(presentCommittmentResponses[presentCommittmentResponses.length - 1].creationTime, "MMM do")}</td>
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
            const maybeCourseMemberships = await viewCourseMembership({
                courseMembershipKind: "STUDENT",
                courseId: props.courseId,
                onlyRecent: true,
                apiKey: props.apiKey.key
            });
            const maybeUnrespondedCommittments = await viewCommittment({
                courseId: props.courseId,
                responded: false,
                minStartTime: fprops.minStartTime,
                apiKey: props.apiKey.key
            });
            const maybeCommittmentResponses = await viewCommittmentResponse({
                courseId: props.courseId,
                minStartTime: fprops.minStartTime,
                apiKey: props.apiKey.key
            });
            const maybeCourseData = await viewCourseData({
                courseId: props.courseId,
                onlyRecent: true,
                apiKey: props.apiKey.key
            });
            if (
                isApiErrorCode(maybeCourseMemberships) || 
                isApiErrorCode(maybeUnrespondedCommittments) || 
                isApiErrorCode(maybeCommittmentResponses) || 
                isApiErrorCode(maybeCourseData)||
                maybeCourseData.length == 0
            ){
                throw Error;
            } else {
                return { 
                    courseMemberships: maybeCourseMemberships, 
                    unrespondedCommittments: maybeUnrespondedCommittments, 
                    committmentResponses: maybeCommittmentResponses,
                    courseData: maybeCourseData[0],
                };
            }
        }}
    />
}

export default CourseViewStatsReport;
