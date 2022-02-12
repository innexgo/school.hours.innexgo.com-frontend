import React from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { Loader, Action, Link , DisplayModal } from '@innexgo/common-react-components';
import { ViewUser, } from '../components/ViewData';
import update from 'immutability-helper';

import { X as DeleteIcon, Eye, Pencil } from 'react-bootstrap-icons'
import { Formik, FormikHelpers, } from 'formik'

import format from "date-fns/format";

import { Course, CourseData, courseDataNew, courseDataView } from '../utils/utils';
import { ApiKey, User } from '@innexgo/frontend-auth-api';

import InstructorArchiveCourseDataForm from '../components/InstructorArchiveCourseDataForm';
import InstructorEditCourseDataForm from '../components/InstructorEditCourseDataForm';

const isActive = (cd: CourseData) => cd.active;

type AdminManageCourseDataTableProps = {
  courseData: CourseData[],
  setCourseData: (courseData: CourseData[]) => void,
  apiKey: ApiKey,
}

function AdminManageCourseDataTable(props: AdminManageCourseDataTableProps) {
  const showInactive = false;

  // this list has an object consisting of both the index in the real array and the object constructs a new objec
  const activeCourseDatas = props.courseData
    // enumerate data + index
    .map((cd, i) => ({ cd, i }))
    // filter inactive
    .filter(({ cd }) => showInactive || isActive(cd));


  const [confirmArchiveCourseDataIndex, setConfirmArchiveCourseDataIndex] = React.useState<number | null>(null);
  const [confirmEditCourseDataIndex, setConfirmEditCourseDataIndex] = React.useState<number | null>(null);

  return <>
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
        {
          activeCourseDatas.length === 0
            ? <tr><td colSpan={4} className="text-center">No current courses.</td></tr>
            : <> </>
        }
        {activeCourseDatas
          .map(({ cd, i }) =>
            <tr key={i}>
              <td>{cd.name}</td>
              <td><ViewUser userId={cd.course.creatorUserId} apiKey={props.apiKey} expanded={false} /></td>
              <td>{format(cd.course.creationTime, "MMM do")}</td>
              <td>
                <Action
                  title="Archive"
                  icon={DeleteIcon}
                  variant="danger"
                  onClick={() => setConfirmArchiveCourseDataIndex(i)}
                />
                <Action
                  title="Edit"
                  icon={Pencil}
                  variant="dark"
                  onClick={() => setConfirmEditCourseDataIndex(i)}
                />
                <Link
                  title="View"
                  icon={Eye}
                  href={`/instructor_manage_course?courseId=${cd.course.courseId}`}
                  variant="dark"
                />
              </td>
            </tr>
          )}
      </tbody>
    </Table>
    {confirmArchiveCourseDataIndex === null ? <> </> :
      <DisplayModal
        title="Confirm Archive"
        show={confirmArchiveCourseDataIndex != null}
        onClose={() => setConfirmArchiveCourseDataIndex(null)}
      >
        <InstructorArchiveCourseDataForm
          apiKey={props.apiKey}
          courseData={props.courseData[confirmArchiveCourseDataIndex]}
          setCourseData={(k) => {
            setConfirmArchiveCourseDataIndex(null);
            props.setCourseData(update(props.courseData, { [confirmArchiveCourseDataIndex]: { $set: k } }))
          }}
        />
      </DisplayModal>
    }
    {confirmEditCourseDataIndex === null ? <> </> :
      <DisplayModal
        title="Edit Course"
        show={confirmEditCourseDataIndex != null}
        onClose={() => setConfirmEditCourseDataIndex(null)}
      >
        <InstructorEditCourseDataForm
          apiKey={props.apiKey}
          courseData={props.courseData[confirmEditCourseDataIndex]}
          setCourseData={(k) => {
            setConfirmEditCourseDataIndex(null);
            props.setCourseData(update(props.courseData, { [confirmEditCourseDataIndex]: { $set: k } }))
          }}
        />
      </DisplayModal>
    }
  </>
}


export default AdminManageCourseDataTable;
