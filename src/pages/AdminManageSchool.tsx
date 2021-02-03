import React from 'react';
import { Container, Popover, Form, Table } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import AdminManageAdminships from '../components/AdminManageAdminships';
import UtilityWrapper from '../components/UtilityWrapper';
import { ViewSchool, ViewUser } from '../components/ViewData';

import { Visibility } from '@material-ui/icons'

import format from "date-fns/format";

import { Async, AsyncProps } from 'react-async';
import { viewSchool, viewCourseData, isApiErrorCode } from '../utils/utils';

const loadSchool = async (props: AsyncProps<School>) => {
  const maybeSchools = await viewSchool({
    schoolId: parseInt(new URLSearchParams(window.location.search).get("schoolId") ?? ""),
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeSchools)) {
    throw Error;
  } else {
    return maybeSchools[0];
  }
}


const loadCourseData = async (props: AsyncProps<CourseData[]>) => {
  const maybeCourseData = await viewCourseData({
    schoolId: props.school.schoolId,
    onlyRecent:true,
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeCourseData )) {
    throw Error;
  } else {
    return maybeCourseData ;
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
                <ViewSchool school={school} apiKey={props.apiKey} expanded />
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
                              <td><ViewUser user={cd.course.creator} apiKey={props.apiKey} expanded={false} /></td>
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
