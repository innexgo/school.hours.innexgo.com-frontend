import React from "react"
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Button, Form } from "react-bootstrap";
import { viewAdminship, viewSchoolData, newCourse, isApiErrorCode } from "../utils/utils";

import SearchSingleSchool from "../components/SearchSingleSchool";

type UserCreateCourseProps = {
  apiKey: ApiKey;
  postSubmit: () => void;
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

    const maybeCourse = await newCourse({
      schoolId: values.schoolId!,
      description: values.description,
      name: values.name,
      apiKey: props.apiKey.key,
    });

    if (isApiErrorCode(maybeCourse)) {
      switch (maybeCourse) {
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
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to delete course.",
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
    props.postSubmit();
  }

  const normalizeCourseName = (e: string) => e.toUpperCase().replace(/[^(A-Z0-9: _\-)]+/g, "").replace(/ +(?= )/g,"");;

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
            <Form.Group >
              <Form.Label>School Name</Form.Label>
              <SearchSingleSchool
                name="courseId"
                search={async (input: string) => {

                  const maybeAdminships = await viewAdminship({
                    userId: props.apiKey.creator.userId,
                    adminshipKind:"ADMIN",
                    partialSchoolName: input,
                    onlyRecent: true,
                    apiKey: props.apiKey.key,
                  });

                  if (isApiErrorCode(maybeAdminships)) {
                    return [];
                  }

                  return (await Promise.all(maybeAdminships.map(async a => {
                    const maybeSchoolData = await viewSchoolData({
                      schoolId: a.school.schoolId,
                      onlyRecent: true,
                      apiKey: props.apiKey.key
                    });
                    if (isApiErrorCode(maybeSchoolData)) {
                      return [];
                    }
                    return maybeSchoolData;
                  }))).flat();
                }}
                isInvalid={!!fprops.errors.schoolId}
                setFn={(e: SchoolData | null) => fprops.setFieldValue("schoolId", e?.school.schoolId)} />
              <Form.Control.Feedback type="invalid">{fprops.errors.schoolId}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group >
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
            <Form.Group >
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
