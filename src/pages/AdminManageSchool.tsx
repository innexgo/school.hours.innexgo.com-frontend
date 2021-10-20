import { Button,Card, Container, Form, Table } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import { Loader, WidgetWrapper, Link } from '@innexgo/common-react-components';
import AdminManageAdminships from '../components/AdminManageAdminships';
import AdminManageSchoolKeys from '../components/AdminManageSchoolKeys'
import { ViewSchool, ViewUser } from '../components/ViewData';
import AdminManageSchoolData from '../components/AdminManageSchoolData';
import ErrorMessage from '../components/ErrorMessage';


import { unwrap } from '@innexgo/frontend-common';

import { Eye } from 'react-bootstrap-icons'

import format from "date-fns/format";

import { Async, AsyncProps } from 'react-async';
import { CourseData, School, schoolView, courseDataView, } from '../utils/utils';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { AuthenticatedComponentProps } from '@innexgo/auth-react-components';

const loadSchool = async (props: AsyncProps<School>) => {
  const maybeSchools = await schoolView({
    schoolId: [props.schoolId],
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
  const schoolId = parseInt(new URLSearchParams(window.location.search).get("schoolId") ?? "");



  return (
    <DashboardLayout {...props}>
      <Container fluid className="py-4 px-4">
        <Async promiseFn={loadSchool} schoolId={schoolId} apiKey={props.apiKey}>
          <Async.Pending><Loader /></Async.Pending>
          <Async.Rejected>{e => <ErrorMessage error={e} />}</Async.Rejected>
          <Async.Fulfilled<School>>{school => <>
            <div className="mx-3 my-3">
              <WidgetWrapper title="School Data">
                <span> Shows basic information about this school.</span>
                <AdminManageSchoolData schoolId={school.schoolId} apiKey={props.apiKey} />
              </WidgetWrapper>
            </div>

            <div className="mx-3 my-3">
              <WidgetWrapper title="Administrators">
                <span>Shows the current administrators of this school.</span>
                <AdminManageAdminships school={school} apiKey={props.apiKey} />
              </WidgetWrapper>
            </div>

            <div className="mx-3 my-3">
              <WidgetWrapper title="Administrator Requests">
                <span>Shows the current requests for admin permissions.</span>
                <AdminManageSchoolKeys schoolId={school.schoolId} apiKey={props.apiKey} />
              </WidgetWrapper>
            </div>


            <div className="mx-3 my-3">
              <WidgetWrapper title="Courses">
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
                                <Link
                                  title="View"
                                  icon={Eye}
                                  href={`/instructor_manage_course?courseId=${cd.course.courseId}`}
                                  variant="dark"
                                />
                              </th>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </>}
                    </Async.Fulfilled>
                  </>}
                </Async>
              </WidgetWrapper>
            </div>


            <div className="mx-3 my-3">
              <WidgetWrapper title="Recent Activity">
                <span>Shows the current courses hosted by this school.</span>
                <Table hover bordered>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Student ID</th>
                      <th>Period</th>
                      <th>Teacher</th>
                      <th>Time In</th>
                      <th>Time Out</th>
                    </tr>
                  </thead>
                  <tbody>
                      <tr><td>Student 1</td><td>3001001</td><td>6</td><td>Carole Ng</td><td>10/20/2019 3:56 PM</td><td>10/20/2019 3:57 PM</td></tr>
                      <tr><td>Student 2</td><td>3001002</td><td>6</td><td>Carole Ng</td><td>10/20/2019 3:56 PM</td><td>10/20/2019 3:58 PM</td></tr>
                      <tr><td>Student 3</td><td>3001003</td><td>6</td><td>Carole Ng</td><td>10/20/2019 3:59 PM</td><td>10/20/2019 4:00 PM</td></tr>
                      <tr><td>Student 4</td><td>3001004</td><td>6</td><td>Carole Ng</td><td>10/20/2019 4:00 PM</td><td>10/20/2019 4:02 PM</td></tr>
                      <tr><td>Student 5</td><td>3001005</td><td>6</td><td>Carole Ng</td><td>10/20/2019 4:02 PM</td><td>10/20/2019 4:03 PM</td></tr>
                      <tr><td>Student 6</td><td>3001006</td><td>6</td><td>Carole Ng</td><td>10/20/2019 4:05 PM</td><td>10/20/2019 4:07 PM</td></tr>
                  </tbody>
                </Table>
              </WidgetWrapper>
            </div>

            <div className="mx-3 my-3">
              <WidgetWrapper title="Where is this student">
                <span>Shows the current courses hosted by this school.</span>
                <div>
                <Form className="mb-5">
                  <Form.Group className="mb-3">
                    <Form.Label>Student ID</Form.Label>
                    <Form.Control></Form.Control>
                  </Form.Group>
                  <Button>Submit</Button>
                </Form>
                <div>
                  <Card>
                  <Card.Body>
                  <Card.Title>
                    Student Location
                  </Card.Title>
                  <Card.Text>
                    <Table>
                      <tr>
                      <th>Teacher</th>
                      <th>Room #</th>
                      <th>Phone #</th>
                      </tr>
                      <tr>
                      <td>Carole Ng</td>
                      <td>503</td>
                      <td>555-5555</td>
                      </tr>
                    </Table>
                  </Card.Text>
                  </Card.Body>

                  </Card>
                </div>
               </div>
              </WidgetWrapper>
            </div>


          </>}
          </Async.Fulfilled>
        </Async>
      </Container>
    </DashboardLayout>
  )
}

export default AdminManageSchool
