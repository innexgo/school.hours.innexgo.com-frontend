import React from 'react';
import { Form, Button, Table, Spinner } from 'react-bootstrap';
import { Action, DisplayModal } from '@innexgo/common-react-components';
import { Async, AsyncProps } from 'react-async';
import { CourseData, CourseMembership, courseMembershipView, courseDataView, courseMembershipNewCancel } from '../utils/utils';
import { ViewUser } from '../components/ViewData';
import { X as DeleteIcon } from 'react-bootstrap-icons';
import { Formik, FormikHelpers } from 'formik'
import format from 'date-fns/format';

import { isErr, unwrap } from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';

type LeaveCourseProps = {
  courseData: CourseData,
  apiKey: ApiKey,
  postSubmit: () => void
};

function LeaveCourse(props: LeaveCourseProps) {

  type LeaveCourseValue = {}

  const onSubmit = async (_: LeaveCourseValue,
    fprops: FormikHelpers<LeaveCourseValue>) => {


    const maybeCancelCourseMembership = await courseMembershipNewCancel({
      userId: props.apiKey.creatorUserId,
      courseId: props.courseData.course.courseId,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeCancelCourseMembership)) {
      switch (maybeCancelCourseMembership.Err) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "USER_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This user does not exist.",
            successResult: ""
          });
          break;
        }
        case "COURSE_ARCHIVED": {
          fprops.setStatus({
            failureResult: "This course has already been archived by your teacher.",
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
      successResult: "Left Course"
    });

    // execute callback
    props.postSubmit();
  }

  return <>
    <Formik<LeaveCourseValue>
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
              Are you sure you want to leave {props.courseData.name}?
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

type CourseDataMembership = {
  courseData: CourseData,
  courseMembership: CourseMembership | null
}

const loadCourseDataMembership = async (props: AsyncProps<CourseDataMembership>) => {
  const courseData = await courseDataView({
    courseId: [props.courseId],
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);

  const courseMemberships = await courseMembershipView({
    courseId: [props.courseId],
    userId: [props.apiKey.creatorUserId],
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);


  return {
    courseData: courseData[0],
    courseMembership: courseMemberships.length === 0
      ? null
      : courseMemberships[0]
  };
}


const StudentManageCourseData = (props: {
  courseId: number,
  apiKey: ApiKey,
}) => {

  const [showLeaveCourse, setShowLeaveCourse] = React.useState(false);

  return <Async
    promiseFn={loadCourseDataMembership}
    apiKey={props.apiKey}
    courseId={props.courseId}>
    {({ reload }) => <>
      <Async.Pending>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Async.Pending>
      <Async.Rejected>
        <span className="text-danger">An unknown error has occured.</span>
      </Async.Rejected>
      <Async.Fulfilled<CourseDataMembership >>{cdm => <>
        <Table hover bordered>
          <tbody>
            <tr>
              <th>Status</th>
              <td>{cdm.courseData.active ? "Active" : "Archived"}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{cdm.courseData.name}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{cdm.courseData.description}</td>
            </tr>
            <tr>
              <th>Creator</th>
              <td><ViewUser userId={cdm.courseData.course.creatorUserId} apiKey={props.apiKey} expanded={false} /></td>
            </tr>
            <tr>
              <th>Creation Time</th>
              <td>{format(cdm.courseData.course.creationTime, "MMM do")} </td>
            </tr>
          </tbody>
        </Table>
        <Action
          title="Leave"
          icon={DeleteIcon}
          variant="danger"
          onClick={() => setShowLeaveCourse(true)}
          hidden={cdm.courseMembership == null || cdm.courseMembership.courseMembershipKind !== "STUDENT"}
        />
        <DisplayModal
          title="Leave Course"
          show={showLeaveCourse}
          onClose={() => setShowLeaveCourse(false)}
        >
          <LeaveCourse
            courseData={cdm.courseData}
            apiKey={props.apiKey}
            postSubmit={() => {
              setShowLeaveCourse(false);
              reload();
            }}
          />
        </DisplayModal>
      </>
      }
      </Async.Fulfilled>
    </>}
  </Async>
}

export default StudentManageCourseData;
