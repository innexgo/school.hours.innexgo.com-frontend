import { Button, Card, Container, Form, Table } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import { Loader, WidgetWrapper, Link } from '@innexgo/common-react-components';
import AdminManageAdminships from '../components/AdminManageAdminships';
import AdminManageSchoolKeys from '../components/AdminManageSchoolKeys'
import AdminManageCourseTable from '../components/AdminManageCourseTable'
import { ViewSchool, ViewUser } from '../components/ViewData';
import AdminManageSchoolData from '../components/AdminManageSchoolData';
import ErrorMessage from '../components/ErrorMessage';

import update from 'immutability-helper';

import { unwrap, getFirstOr } from '@innexgo/frontend-common';

import format from "date-fns/format";

import { Async, AsyncProps } from 'react-async';
import { CourseData, SchoolData, SchoolKeyData, schoolKeyDataView, schoolDataView, courseDataView, adminshipView, Adminship } from '../utils/utils';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { AuthenticatedComponentProps } from '@innexgo/auth-react-components';

type ManageSchoolData = {
  schoolData: SchoolData,
  courseData: CourseData[],
  schoolKeyData: SchoolKeyData[],
  adminships: Adminship[],
}

const loadManageSchoolData = async (props: AsyncProps<ManageSchoolData>) => {
  const schoolData = await schoolDataView({
    schoolId: [props.schoolId],
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap)
    .then(x => getFirstOr(x, "NOT_FOUND"))
    .then(unwrap);

  const courseData = await courseDataView({
    schoolId: [props.schoolId],
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);

  const schoolKeyData = await schoolKeyDataView({
    schoolId: [props.schoolId],
    active: true,
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);

  const adminships = await adminshipView({
    schoolId: [props.schoolId],
    apiKey: props.apiKey.key,
    adminshipKind: ["ADMIN"],
    onlyRecent: true,
  })
    .then(unwrap);


  return {
    schoolData,
    courseData,
    schoolKeyData,
    adminships
  };
}

function AdminManageSchool(props: AuthenticatedComponentProps) {
  const schoolId = parseInt(new URLSearchParams(window.location.search).get("schoolId") ?? "");

  return (
    <DashboardLayout {...props}>
      <Container fluid className="py-4 px-4">
        <Async promiseFn={loadManageSchoolData} schoolId={schoolId} apiKey={props.apiKey}>{
          ({ setData }) => <>
            <Async.Pending><Loader /></Async.Pending>
            <Async.Rejected>{e => <ErrorMessage error={e} />}</Async.Rejected>
            <Async.Fulfilled<ManageSchoolData>>{data => <>
              <div className="mx-3 my-3">
                <WidgetWrapper title="School Data">
                  <span>Shows basic information about this school.</span>
                  <AdminManageSchoolData schoolId={data.schoolData.school.schoolId} apiKey={props.apiKey} />
                </WidgetWrapper>
              </div>

              <div className="mx-3 my-3">
                <WidgetWrapper title="Administrators">
                  <span>Shows the current administrators of this school.</span>
                  <AdminManageAdminships school={data.schoolData.school} apiKey={props.apiKey} />
                </WidgetWrapper>
              </div>

              <div className="mx-3 my-3">
                <WidgetWrapper title="Administrator Requests">
                  <span>Shows the current requests for admin permissions.</span>
                  <AdminManageSchoolKeys schoolId={data.schoolData.school.schoolId} apiKey={props.apiKey} />
                </WidgetWrapper>
              </div>

              <div className="mx-3 my-3">
                <WidgetWrapper title="Courses">
                  <span>Shows the current courses hosted by this school.</span>
                  <AdminManageCourseTable
                    courseData={data.courseData}
                    setCourseData={courseData => setData(update(data, { courseData: { $set: courseData } }))}
                    apiKey={props.apiKey}
                  />
                </WidgetWrapper>
              </div>
            </>}
            </Async.Fulfilled>
          </>}
        </Async>
      </Container>
    </DashboardLayout>
  )
}

export default AdminManageSchool
