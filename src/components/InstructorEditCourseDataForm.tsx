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

export default function InstructorEditCourseDataForm(props: EditCourseDataProps) {

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
      locationId: props.courseData.location.locationId,
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

