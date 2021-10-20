import React from 'react';
import { Form, Button, Table } from 'react-bootstrap';
import { Loader, Action } from '@innexgo/common-react-components';
import { Async, AsyncProps } from 'react-async';
import DisplayModal from '../components/DisplayModal';
import { courseDataView, courseDataNew, CourseData, normalizeCourseName } from '../utils/utils';
import { ViewUser } from '../components/ViewData';
import { Pencil as EditIcon, X as DeleteIcon, BoxArrowUp as RestoreIcon } from 'react-bootstrap-icons';
import { Formik, FormikHelpers } from 'formik'
import format from 'date-fns/format';
import { isErr, unwrap } from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';


type EditCourseDataProps = {
  courseData: CourseData,
  setCourseData: (courseData: CourseData) => void,
  apiKey: ApiKey,
};

function EditCourseData(props: EditCourseDataProps) {

  type EditCourseDataValue = {
    name: string,
    description: string,
    homeroom: boolean,
  }

  const onSubmit = async (values: EditCourseDataValue,
    fprops: FormikHelpers<EditCourseDataValue>) => {

    const maybeCourseData = await courseDataNew({
      courseId: props.courseData.course.courseId,
      apiKey: props.apiKey.key,
      name: values.name,
      description: values.description,
      homeroom: values.homeroom,
      active: props.courseData.active,
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
            failureResult: "You are not authorized to modify this course.",
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
            failureResult: "An unknown or network error has occured while modifying course data.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Course Successfully Modified"
    });

    // execute callback
    props.setCourseData(maybeCourseData.Ok);
  }

  return <>
    <Formik<EditCourseDataValue>
      onSubmit={onSubmit}
      initialValues={{
        name: props.courseData.name,
        description: props.courseData.description,
        homeroom: props.courseData.homeroom,
      }}
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
            <Form.Group className="mb-3">
              <Form.Label>Course Name</Form.Label>
              <Form.Control
                name="name"
                type="text"
                placeholder="Course Name"
                as="input"
                value={fprops.values.name}
                onChange={e => fprops.setFieldValue("name", normalizeCourseName(e.target.value))}
                isInvalid={!!fprops.errors.name}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Course Description</Form.Label>
              <Form.Control
                name="description"
                type="text"
                placeholder="Course Description"
                value={fprops.values.description}
                onChange={e => fprops.setFieldValue("description", e.target.value)}
                isInvalid={!!fprops.errors.description}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.description}</Form.Control.Feedback>
            </Form.Group>
            <Form.Check className="mb-3 form-check">
              <Form.Check.Input
                name="homeroom"
                checked={fprops.values.homeroom}
                isInvalid={!!fprops.errors.homeroom}
                onClick={fprops.handleChange}
              />
              <Form.Check.Label>Homeroom Class</Form.Check.Label>
              <Form.Control.Feedback type="invalid">{fprops.errors.homeroom}</Form.Control.Feedback>
            </Form.Check>
            <Form.Group className="mb-3">
              <Button type="submit">Submit</Button>
            </Form.Group>
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}


type ArchiveCourseProps = {
  courseData: CourseData,
  apiKey: ApiKey,
  setCourseData: (courseData: CourseData) => void
};

function ArchiveCourse(props: ArchiveCourseProps) {

  type ArchiveCourseValue = {}

  const onSubmit = async (_: ArchiveCourseValue,
    fprops: FormikHelpers<ArchiveCourseValue>) => {

    const maybeCourseData = await courseDataNew({
      courseId: props.courseData.course.courseId,
      apiKey: props.apiKey.key,
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
      <EditCourseData
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
      <ArchiveCourse
        courseData={props.courseData}
        apiKey={props.apiKey}
        setCourseData={courseData => {
          setShowArchiveCourse(false);
          props.setCourseData(courseData);
        }}
      />
    </DisplayModal>
  </>
}

export default InstructorManageCourseData;
