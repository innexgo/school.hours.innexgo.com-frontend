import React from 'react';
import { Table } from 'react-bootstrap';
import { Action } from '@innexgo/common-react-components';
import DisplayModal from '../components/DisplayModal';
import { CourseData} from '../utils/utils';
import { ViewUser } from '../components/ViewData';
import { Pencil as EditIcon, X as DeleteIcon, BoxArrowUp as RestoreIcon } from 'react-bootstrap-icons';
import format from 'date-fns/format';
import { ApiKey } from '@innexgo/frontend-auth-api';

import InstructorArchiveCourseDataForm from '../components/InstructorArchiveCourseDataForm';
import InstructorEditCourseDataForm from '../components/InstructorEditCourseDataForm';

const InstructorManageCourseData = (props: {
  courseData: CourseData,
  setCourseData: (courseData: CourseData) => void,
  apiKey: ApiKey,
}) => {

  const [showEditCourseData, setShowEditCourseData] = React.useState(false);
  const [showArchiveCourse, setShowArchiveCourse] = React.useState(false);
  return <>
    <Table hover bordered>
      <tbody>
        <tr>
          <th>Status</th>
          <td>{props.courseData.active ? "Active" : "Archived"}</td>
        </tr>
        <tr>
          <th>Name</th>
          <td>{props.courseData.name}</td>
        </tr>
        <tr>
          <th>Description</th>
          <td>{props.courseData.description}</td>
        </tr>
        <tr>
          <th>Homeroom</th>
          <td>{props.courseData.homeroom ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <th>Creator</th>
          <td><ViewUser userId={props.courseData.course.creatorUserId} apiKey={props.apiKey} expanded={false} /></td>
        </tr>
        <tr>
          <th>Creation Time</th>
          <td>{format(props.courseData.course.creationTime, "MMM do")} </td>
        </tr>
      </tbody>
    </Table>
    <Action
      title="Edit"
      icon={EditIcon}
      onClick={() => setShowEditCourseData(true)}
    />

    {props.courseData.active
      ? <Action
        title="Delete"
        icon={DeleteIcon}
        variant="danger"
        onClick={() => setShowArchiveCourse(true)}
      />
      : <Action
        title="Restore"
        icon={RestoreIcon}
        variant="danger"
        onClick={() => setShowArchiveCourse(true)}
      />
    }

    <DisplayModal
      title="Edit Course"
      show={showEditCourseData}
      onClose={() => setShowEditCourseData(false)}
    >
      <InstructorEditCourseDataForm
        courseData={props.courseData}
        apiKey={props.apiKey}
        setCourseData={courseData => {
          setShowEditCourseData(false);
          props.setCourseData(courseData);
        }}
      />
    </DisplayModal>

    <DisplayModal
      title="Archive Course"
      show={showArchiveCourse}
      onClose={() => setShowArchiveCourse(false)}
    >
      <InstructorArchiveCourseDataForm
        apiKey={props.apiKey}
        courseData={props.courseData}
        setCourseData={courseData => {
          setShowArchiveCourse(false);
          props.setCourseData(courseData);
        }}
      />
    </DisplayModal>
  </>
}

export default InstructorManageCourseData;
