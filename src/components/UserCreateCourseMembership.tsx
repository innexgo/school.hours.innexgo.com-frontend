import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Button, Form } from "react-bootstrap";
import { courseMembershipNewKey} from "../utils/utils";
import {isErr} from '@innexgo/frontend-common';
import {ApiKey, AuthenticatedComponentProps } from '@innexgo/frontend-auth-api';

type UserCreateCourseMembershipProps = {
  apiKey: ApiKey;
  postSubmit: (cm:CourseMembership) => void;
}

// TODO we need to ensure that the abbreviation is truly unique between schools

function UserCreateCourseMembership(props: UserCreateCourseMembershipProps) {

  type CreateCourseMembershipValue = {
    key: string,
  }

  const onSubmit = async (values: CreateCourseMembershipValue,
    fprops: FormikHelpers<CreateCourseMembershipValue>) => {

    let errors: FormikErrors<CreateCourseMembershipValue> = {};

    // Validate input

    let hasError = false;
    if (values.key === "") {
      errors.key = "Please enter a course key";
      hasError = true;
    }

    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeCourseMembership = await courseMembershipNewKey({
      courseKeyKey: values.key,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeCourseMembership)) {
      switch (maybeCourseMembership.Err) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You don't have the ability to join this course.",
            successResult: ""
          });
          break;
        }
        case "COURSE_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This key is invalid.",
            successResult: ""
          });
          break;
        }
        case "COURSE_KEY_EXPIRED": {
          fprops.setStatus({
            failureResult: "This key has expired.",
            successResult: ""
          });
          break;
        }
        case "COURSE_KEY_USED": {
          fprops.setStatus({
            failureResult: "This key has already been used.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to register.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "CourseMembership Created"
    });
    // execute callback
    props.postSubmit(maybeCourseMembership.Ok);
  }

  const normalizeKey = (e: string) => e.replace(/[^(A-Za-z0-9_=\-)]/g, "");

  return <>
    <Formik<CreateCourseMembershipValue>
      onSubmit={onSubmit}
      initialValues={{
        key: "",
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
              <Form.Label>Course Key</Form.Label>
              <Form.Control
                name="key"
                type="text"
                placeholder="Course Key"
                as="input"
                value={fprops.values.key}
                onChange={e => fprops.setFieldValue("key", normalizeKey(e.target.value))}
                isInvalid={!!fprops.errors.key}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.key}</Form.Control.Feedback>
            </Form.Group>
            <Button type="submit">Join</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

export default UserCreateCourseMembership;
