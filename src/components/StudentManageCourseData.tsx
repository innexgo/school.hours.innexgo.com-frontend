import React from 'react';
import { Form, Button, Table } from 'react-bootstrap'; import Loader from '../components/Loader';
import { Async, AsyncProps } from 'react-async';
import DisplayModal from '../components/DisplayModal';
import { viewCourseData, newCourseData, isApiErrorCode, normalizeCourseName } from '../utils/utils';
import { ViewUser } from '../components/ViewData';
import { Edit, Archive, Unarchive} from '@material-ui/icons';
import { Formik, FormikHelpers } from 'formik'
import format from 'date-fns/format';

const loadCourseData = async (props: AsyncProps<CourseData>) => {
  const maybeCourseData = await viewCourseData({
    courseId: props.courseId,
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeCourseData) || maybeCourseData.length === 0) {
    throw Error;
  } else {
    return maybeCourseData[0];
  }
}


const StudentManageCourseData = (props: {
  courseId: number,
  apiKey: ApiKey,
}) => {


  return <Async
    promiseFn={loadCourseData}
    apiKey={props.apiKey}
    courseId={props.courseId}>
    {({ reload }) => <>
      <Async.Pending><Loader /></Async.Pending>
      <Async.Rejected>
        <span className="text-danger">An unknown error has occured.</span>
      </Async.Rejected>
      <Async.Fulfilled<CourseData>>{courseData => <>
        <Table hover bordered>
          <tbody>
            <tr>
              <th>Status</th>
              <td>{courseData.active ? "Active" : "Archived"}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{courseData.name}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{courseData.description}</td>
            </tr>
            <tr>
              <th>Creator</th>
              <td><ViewUser user={courseData.course.creator} apiKey={props.apiKey} expanded={false} /></td>
            </tr>
            <tr>
              <th>Creation Time</th>
              <td>{format(courseData.course.creationTime, "MMM do")} </td>
            </tr>
          </tbody>
        </Table>
      </>
      }
      </Async.Fulfilled>
    </>}
  </Async>
}

export default StudentManageCourseData;
