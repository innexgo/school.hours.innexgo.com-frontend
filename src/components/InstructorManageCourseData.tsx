import React from 'react';
import { Button, Table } from 'react-bootstrap'; import Loader from '../components/Loader';
import { Async, AsyncProps } from 'react-async';
import { viewCourseData, newCourseData, isApiErrorCode } from '../utils/utils';
import { ViewUser } from '../components/ViewData';
import { Edit, Delete } from '@material-ui/icons';
import format from 'date-fns/format';


const loadCourseData = async (props: AsyncProps<CourseData | null>) => {
  const maybeCourseData = await viewCourseData({
    courseId: props.courseId,
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeCourseData)) {
    throw Error;
  } else {
    return maybeCourseData.length === 0
      ? null
      : maybeCourseData[0];
  }
}


const InstructorManageCourseData = (props: {
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
      <Async.Fulfilled<CourseData | null>>{courseData =>
        courseData
          ?
          <div>
          <Table hover bordered>
            <tbody>
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
          <Button variant="secondary">Edit <Edit /></Button>
          <Button variant="danger">Archive <Delete /></Button>
          </div>
          :
          <p className="text-danger">Invalid URL, could not load course data.</p>
      }
      </Async.Fulfilled>
    </>}
  </Async>
}

export default InstructorManageCourseData;
