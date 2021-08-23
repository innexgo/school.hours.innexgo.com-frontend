import { Form, Table } from 'react-bootstrap';
import { Loader } from '@innexgo/common-react-components';
import { ViewUser, } from '../components/ViewData';

import format from "date-fns/format";

import { Async, AsyncProps } from 'react-async';
import { CourseMembership, CourseMembershipKind, courseMembershipView } from '../utils/utils';
import { isErr, unwrap } from '@innexgo/frontend-common';

import { ApiKey } from '@innexgo/frontend-auth-api';


type InternalStudentManageCourseMembershipsProps = {
  // its critical that we pass the function as a prop, because if we define it inside this function, react-async will break
  loadMemberships: (props: AsyncProps<CourseMembership[]>) => Promise<CourseMembership[]>,
  courseId: number,
  apiKey: ApiKey,
}

function InternalStudentManageCourseMemberships(props: InternalStudentManageCourseMembershipsProps) {


  return <>
    <Async promiseFn={props.loadMemberships}>
      {_ => <>
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
              </tr>
            </thead>
            <tbody>
              {
                data.length === 0
                  ? <tr><td colSpan={3} className="text-center">No current members.</td></tr>
                  : data.map((a: CourseMembership) =>
                    <tr>
                      <td><ViewUser userId={a.userId} apiKey={props.apiKey} expanded={false} /></td>
                      <td>{format(a.creationTime, "MMM do")}</td>
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

type StudentManageCourseMembershipsProps = {
  courseMembershipKind: CourseMembershipKind,
  courseId: number,
  apiKey: ApiKey,
}

function StudentManageCourseMemberships(props: StudentManageCourseMembershipsProps) {
  return <InternalStudentManageCourseMemberships
    courseId={props.courseId}
    apiKey={props.apiKey}
    loadMemberships={async (_: AsyncProps<CourseMembership[]>) =>
      await courseMembershipView({
        courseId: [props.courseId],
        courseMembershipKind: [props.courseMembershipKind],
        onlyRecent: true,
        apiKey: props.apiKey.key
      })
        .then(unwrap)
    }
  />
}

export default StudentManageCourseMemberships;
