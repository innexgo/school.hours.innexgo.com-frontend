
import React from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import Loader from '../components/Loader';
import DisplayModal from '../components/DisplayModal';
import { ViewUser, } from '../components/ViewData';

import { Delete, } from '@material-ui/icons'
import { Formik, FormikHelpers, } from 'formik'

import format from "date-fns/format";

import { Async, AsyncProps } from 'react-async';
import { viewCourseMembership, isApiErrorCode, viewCommittment, viewCommittmentResponse } from '../utils/utils';

type CourseStatsReportData = {
    courseMemberships: CourseMembership[],
    unrespondedCommittments: Committment[],
    committmentResponses: CommittmentResponse[],
}

type InternalCourseViewStatsReportProps = {
    // its critical that we pass the function as a prop, because if we define it inside this function, react-async will break
    loadMemberships: (fprops: AsyncProps<CourseStatsReportData>) => Promise<CourseStatsReportData>,
    courseId: number,
    apiKey: ApiKey,
}

function InternalCourseViewStatsReport(props: InternalCourseViewStatsReportProps) {

    return <>
        <Async promiseFn={props.loadMemberships}>
            {({ reload }) => <>
                <Async.Pending><Loader /></Async.Pending>
                <Async.Rejected>
                    <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
                </Async.Rejected>
                <Async.Fulfilled<CourseMembership[]>>{data => <>
                    <Table hover bordered>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Date Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.length === 0
                                    ? <tr><td colSpan={3} className="text-center">No current members.</td></tr>
                                    : data.map((a: CourseMembership) =>
                                        <tr>
                                            <td><ViewUser user={a.user} apiKey={props.apiKey} expanded={false} /></td>
                                            <td>{format(a.creationTime, "MMM do")}</td>
                                            <th>
                                                <Button variant="link" className="text-dark"
                                                    onClick={() => setConfirmRemoveUser(a.user)}>
                                                    <Delete />
                                                </Button>
                                            </th>
                                        </tr>
                                    )}
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
            if (isApiErrorCode(maybeCourseMemberships) || isApiErrorCode(maybeUnrespondedCommittments) || isApiErrorCode(maybeCommittmentResponses)) {
                throw Error;
            } else {
                return { 
                    courseMemberships: maybeCourseMemberships, 
                    unrespondedCommittments: maybeUnrespondedCommittments, 
                    committmentResponses: maybeCommittmentResponses
                };
            }
        }}
    />
}

export default CourseViewStatsReport;
