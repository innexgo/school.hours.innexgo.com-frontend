import React from 'react';
import { Form, Button, Table } from 'react-bootstrap';
import { Loader, Action, DisplayModal } from '@innexgo/common-react-components';
import { Async, AsyncProps } from 'react-async';
import { courseDataView, courseDataNew, CourseData, normalizeCourseName } from '../utils/utils';
import { ViewUser } from '../components/ViewData';
import { Pencil as EditIcon, X as DeleteIcon, BoxArrowUp as RestoreIcon } from 'react-bootstrap-icons';
import { Formik, FormikHelpers } from 'formik'
import format from 'date-fns/format';
import { isErr, unwrap } from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';


type ArchiveCourseProps = {
  courseData: CourseData,
  apiKey: ApiKey,
  setCourseData: (courseData: CourseData) => void
};

export default function InstructorArchiveCourseDataForm(props: ArchiveCourseProps) {

  type ArchiveCourseValue = {}

  const onSubmit = async (_: ArchiveCourseValue,
    fprops: FormikHelpers<ArchiveCourseValue>) => {

    const maybeCourseData = await courseDataNew({
      courseId: props.courseData.course.courseId,
      apiKey: props.apiKey.key,
      locationId: props.courseData.location.locationId,
      name: props.courseData.name,
      description: props.courseData.description,
      homeroom: props.courseData.homeroom,
      active: !props.courseData.active,
    });

    if (isErr(maybeCourseData)) {
      switch (maybeCourseData.Err) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to manage this course.",
            successResult: ""
          });
          break;
        }
        case "COURSE_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This course does not exist.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while managing course.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Course Edited"
    });

    // execute callback
    props.setCourseData(maybeCourseData.Ok);
  }

  return <>
    <Formik<ArchiveCourseValue>
      onSubmit={onSubmit}
      initialValues={{}}
      initialStatus={{
        failureResult: "",
        successResult: ""
      }}
    >
      {(fprops) => <>
        <Form
          noValidate
          onSubmit={fprops.handleSubmit} >
          <div hidden={fprops.status.successResult !== ""}>
            <p>
              Are you sure you want to {props.courseData.active ? "archive" : "unarchive"} {props.courseData.name}?
            </p>
            <Button type="submit">Confirm</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

