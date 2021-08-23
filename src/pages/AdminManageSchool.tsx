import { Container, Form, Table } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import { Loader } from '@innexgo/common-react-components';
import AdminManageAdminships from '../components/AdminManageAdminships';
import AdminManageSchoolKeys from '../components/AdminManageSchoolKeys'
import UtilityWrapper from '../components/UtilityWrapper';
import { ViewSchool, ViewUser } from '../components/ViewData';
import AdminManageSchoolData from '../components/AdminManageSchoolData';

import {unwrap} from '@innexgo/frontend-common';

import { Eye as Visibility } from 'react-bootstrap-icons'

import format from "date-fns/format";

import { Async, AsyncProps } from 'react-async';
import { CourseData, School, schoolView, courseDataView, } from '../utils/utils';
import { ApiKey} from '@innexgo/frontend-auth-api';
import {AuthenticatedComponentProps } from '@innexgo/auth-react-components';

const loadSchool = async (props: AsyncProps<School>) => {
  const maybeSchools = await schoolView({
    schoolId: [parseInt(new URLSearchParams(window.location.search).get("schoolId") ?? "")],
    apiKey: props.apiKey.key
  })
  .then(unwrap);

  return maybeSchools[0];
}


const loadCourseData = async (props: AsyncProps<CourseData[]>) => {
  const maybeCourseData = await courseDataView({
    schoolId: [props.school.schoolId],
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
  .then(unwrap);

  return maybeCourseData;

}

// TODO can someone clean this up later
function AdminManageSchool(props: AuthenticatedComponentProps) {
  return (
    <DashboardLayout {...props}>
      <Container fluid className="py-4 px-4">
        <Async promiseFn={loadSchool} apiKey={props.apiKey}>
          <Async.Pending><Loader /></Async.Pending>
          <Async.Rejected>
            <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
          </Async.Rejected>
          <Async.Fulfilled<School>>{school => <>
            <div className="mx-3 my-3">
              <UtilityWrapper title="School Data">
                <span> Shows basic information about this school.</span>
                <AdminManageSchoolData schoolId={school.schoolId} apiKey={props.apiKey} />
              </UtilityWrapper>
            </div>

            <div className="mx-3 my-3">
              <UtilityWrapper title="Administrators">
                <span>Shows the current administrators of this school.</span>
                <AdminManageAdminships school={school} apiKey={props.apiKey} />
              </UtilityWrapper>
            </div>

            <div className="mx-3 my-3">
              <UtilityWrapper title="Administrator Requests">
                <span> Shows the current administrators of this school.</span>
                <AdminManageSchoolKeys schoolId={school.schoolId} apiKey={props.apiKey} />
              </UtilityWrapper>
            </div>


            <div className="mx-3 my-3">
              <UtilityWrapper title="Courses">
                <span>Shows the current courses hosted by this school.</span>
                <Async promiseFn={loadCourseData} apiKey={props.apiKey} school={school}>
                  {({ reload }) => <>
                    <Async.Pending><Loader /></Async.Pending>
                    <Async.Rejected>
                      <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
                    </Async.Rejected>
                    <Async.Fulfilled<CourseData[]>>{data => <>
                      <Table hover bordered>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Creator</th>
                            <th>Date Created</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((cd: CourseData) =>
                            <tr>
                              <td>{cd.name}</td>
                              <td><ViewUser userId={cd.course.creatorUserId} apiKey={props.apiKey} expanded={false} /></td>
                              <td>{format(cd.course.creationTime, "MMM do")}</td>
                              <th>
                                <a href={`/instructor_manage_course?courseId=${cd.course.courseId}`} className="text-dark">
                                  <Visibility />
                                </a>
                              </th>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </>}
                    </Async.Fulfilled>
                  </>}
                </Async>
              </UtilityWrapper>
            </div>
          </>}
          </Async.Fulfilled>
        </Async>
      </Container>
    </DashboardLayout>
  )
}

export default AdminManageSchool
