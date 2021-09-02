import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Button, Form } from "react-bootstrap";
import { SchoolData, CourseData, schoolDataView, courseNew, normalizeCourseName, adminshipView } from "../utils/utils";
import { isErr, unwrap } from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';

import SearchSingleSchool from "../components/SearchSingleSchool";

type UserCreateCourseProps = {
  apiKey: ApiKey;
  postSubmit: (cd: CourseData) => void;
}

function UserCreateCourse(props: UserCreateCourseProps) {

  type CreateCourseValue = {
    schoolId: null | number,
    name: string,
    description: string,
  }

  const onSubmit = async (values: CreateCourseValue,
    fprops: FormikHelpers<CreateCourseValue>) => {

    let errors: FormikErrors<CreateCourseValue> = {};

    // Validate input
    let hasError = false;
    if (values.schoolId === null) {
      errors.name = "Please select a school where you are an administrator.";
      hasError = true;
    }
    if (values.name === "") {
      errors.name = "Please enter a course name.";
      hasError = true;
    }
    if (values.description === "") {
      errors.description = "Please enter a brief description of your course.";
      hasError = true;
    }

    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeCourseData = await courseNew({
      schoolId: values.schoolId!,
      description: values.description,
      name: values.name,
      apiKey: props.apiKey.key,
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
        case "SCHOOL_ARCHIVED": {
          fprops.setStatus({
            failureResult: "This school has been archived",
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
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to create  course.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Course Created"
    });
    // execute callback
    props.postSubmit(maybeCourseData.Ok);
  }

  return <>
    <Formik<CreateCourseValue>
      onSubmit={onSubmit}
      initialValues={{
        schoolId: null,
        name: "",
        description: ""
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
              <Form.Label>School Name</Form.Label>
              <SearchSingleSchool
                name="courseId"
                search={async (input: string) => {

                  const adminships = await adminshipView({
                    userId: [props.apiKey.creatorUserId],
                    adminshipKind: ["ADMIN"],
                    onlyRecent: true,
                    apiKey: props.apiKey.key,
                  })
                    .then(unwrap);

                  const schoolData = await schoolDataView({
                    schoolId: adminships.map(a => a.school.schoolId),
                    partialName: input,
                    onlyRecent: true,
                    apiKey: props.apiKey.key,
                  })
                    .then(unwrap);

                  return schoolData;

                }}
                isInvalid={!!fprops.errors.schoolId}
                setFn={(e: SchoolData | null) => fprops.setFieldValue("schoolId", e?.school.schoolId)} />
              <Form.Control.Feedback type="invalid">{fprops.errors.schoolId}</Form.Control.Feedback>
            </Form.Group>
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
              <Form.Label >Course Description</Form.Label>
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
            <Button type="submit">Submit Form</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

export default UserCreateCourse;
