import React from 'react';
import { Form, Button, Table } from 'react-bootstrap'; import Loader from '../components/Loader';
import { Async, AsyncProps } from 'react-async';
import DisplayModal from '../components/DisplayModal';
import { viewCourseData, newCourseData, isApiErrorCode, normalizeCourseName, newSetCourseMembership } from '../utils/utils';
import { ViewUser } from '../components/ViewData';
import { Cancel } from '@material-ui/icons';
import { Formik, FormikHelpers } from 'formik'
import format from 'date-fns/format';

type LeaveCourseProps = {
  user: User,
  courseData: CourseData,
  apiKey: ApiKey,
  postSubmit: () => void
};

function LeaveCourse(props: LeaveCourseProps) {

  type LeaveCourseValue = {}

  const onSubmit = async (_: LeaveCourseValue,
    fprops: FormikHelpers<LeaveCourseValue>) => {


    const maybeSetCourseMembership = await newSetCourseMembership({
      userId: props.user.userId,
      courseId: props.courseData.course.courseId,
      courseMembershipKind: "CANCEL",
      apiKey: props.apiKey.key,
    });

    if (isApiErrorCode(maybeSetCourseMembership)) {
      switch (maybeSetCourseMembership) {
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
  user: User,
  courseId: number,
  apiKey: ApiKey,
}) => {

  const [showLeaveCourse, setShowLeaveCourse] = React.useState(false);

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
        <Button variant="danger" onClick={_ => setShowLeaveCourse(true)}>Leave <Cancel /></Button>
        <DisplayModal
          title="Leave Course"
          show={showLeaveCourse}
          onClose={() => setShowLeaveCourse(false)}
        >
          <LeaveCourse
            user={props.user}
            courseData={courseData}
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
