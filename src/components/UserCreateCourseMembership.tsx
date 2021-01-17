import React from "react"
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Button, Form } from "react-bootstrap";
import { newCourseMembership, isApiErrorCode } from "../utils/utils";

/*
type UserCreateCourseMembershipProps = {
  apiKey: ApiKey;
  postSubmit: () => void;
}

// TODO we need to ensure that the abbreviation is truly unique between schools

function UserCreateCourseMembership(props: UserCreateCourseMembershipProps) {

  type CreateCourseMembershipValue = {
    name: string,
    abbreviation: string,
  }

  const onSubmit = async (values: CreateCourseMembershipValue,
    fprops: FormikHelpers<CreateCourseMembershipValue>) => {

    let errors: FormikErrors<CreateCourseMembershipValue> = {};

    // Validate input

    let hasError = false;
    if (values.name === "") {
      errors.name = "Please enter your school name";
      hasError = true;
    }
    if (values.abbreviation === "") {
      errors.abbreviation = "Please enter a unique school abbreviation";
      hasError = true;
    }

    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeCourseMembership = await newCourseMembership({
      abbreviation: values.abbreviation,
      name: values.name,
      apiKey: props.apiKey.key,
    });

    if (isApiErrorCode(maybeCourseMembership)) {
      switch (maybeCourseMembership) {
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
            failureResult: "An unknown or network error has occured while trying to register.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureMessage: "",
      successMessage: "CourseMembership Created"
    });
    // execute callback
    props.postSubmit();
  }

  const normalizeInput = (e: string) => e.toUpperCase().replace(/[^A-Z]+/g, "");

  return <>
    <Formik<CreateCourseMembershipValue>
      onSubmit={onSubmit}
      initialValues={{
        name: "",
        abbreviation: ""
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
          <div hidden={fprops.status.successMessage !== ""}>
            <Form.Group >
              <Form.Label>CourseMembership Name</Form.Label>
              <Form.Control
                name="name"
                type="text"
                placeholder="CourseMembership Name"
                as="input"
                value={fprops.values.name}
                onChange={e => fprops.setFieldValue("name", normalizeInput(e.target.value))}
                isInvalid={!!fprops.errors.name}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group >
              <Form.Label >CourseMembership Abbreviation</Form.Label>
              <Form.Control
                name="abbreviation"
                type="text"
                placeholder="CourseMembership Abbreviation"
                value={fprops.values.abbreviation}
                onChange={e => fprops.setFieldValue("abbreviation", normalizeInput(e.target.value))}
                isInvalid={!!fprops.errors.abbreviation}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.abbreviation}</Form.Control.Feedback>
            </Form.Group>
            <Button type="submit">Submit form</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureMessage}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successMessage}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

export default UserCreateCourseMembership;
*/
function UserCreateCourseMembership() {
  return <div></div>
}
export default UserCreateCourseMembership;
