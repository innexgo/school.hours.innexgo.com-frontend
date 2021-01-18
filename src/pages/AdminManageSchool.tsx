
import React from 'react';
import { Button, Tabs, Tab, Row, Container, Popover, Form, Table } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import AdminManageAdminships from '../components/AdminManageAdminships';
import UtilityWrapper from '../components/UtilityWrapper';
import { ViewSchool, ViewUser, ViewCourse } from '../components/ViewData';

import { Delete, Visibility, Settings, Add } from '@material-ui/icons'
import { Formik, FormikHelpers, FormikErrors } from 'formik'

import SearchMultiUser from "../components/SearchMultiUser";

import format from "date-fns/format";

import { Async, AsyncProps } from 'react-async';
import { viewUser, newAdminship, viewSchool, viewCourse, viewAdminship, isApiErrorCode } from '../utils/utils';

const loadSchool = async () => {
  const maybeSchools = await viewSchool({
    schoolId: parseInt(new URLSearchParams(window.location.search).get("schoolId") ?? ""),
  });

  if (isApiErrorCode(maybeSchools)) {
    throw Error;
  } else {
    return maybeSchools[0];
  }
}


const loadCourses = async (props: AsyncProps<Course[]>) => {
  const maybeCourses = await viewCourse({
    schoolId: props.school.schoolId,
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeCourses)) {
    throw Error;
  } else {
    return maybeCourses;
  }
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
                <Popover id="information-tooltip"> Shows basic information about this school. </Popover>
                <ViewSchool school={school} expanded />
              </UtilityWrapper>
            </div>

            <div className="mx-3 my-3">
              <UtilityWrapper title="Administrators">
                <Popover id="information-tooltip"> Shows the current administrators of this school. </Popover>
                <AdminManageAdminships school={school} apiKey={props.apiKey} />
              </UtilityWrapper>
            </div>

            <div className="mx-3 my-3">
              <UtilityWrapper title="Courses">
                <Popover id="information-tooltip"> Shows the current courses hosted by this school. </Popover>
                <Async promiseFn={loadCourses} apiKey={props.apiKey} school={school}>
                  {({ reload }) => <>
                    <Async.Pending><Loader /></Async.Pending>
                    <Async.Rejected>
                      <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
                    </Async.Rejected>
                    <Async.Fulfilled<Course[]>>{data => <>
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
                          {data.map((c: Course) =>
                            <tr>
                              <td>{c.name}</td>
                              <td><ViewUser user={c.creator} expanded={false} /></td>
                              <td>{format(c.creationTime, "MMM do")}</td>
                              <th>
                                <a href={`/instructor_manage_course?courseId=${c.courseId}`} className="text-dark">
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
