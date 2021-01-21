import React from "react"
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Button, Form } from "react-bootstrap";
import { newSchool, isApiErrorCode } from "../utils/utils";

type UserCreateSchoolProps = {
  apiKey: ApiKey;
  postSubmit: () => void;
}

// TODO we need to ensure that the abbreviation is truly unique between schools

function UserCreateSchool(props: UserCreateSchoolProps) {

  type CreateSchoolValue = {
    name: string,
  }

  const onSubmit = async (values: CreateSchoolValue,
    fprops: FormikHelpers<CreateSchoolValue>) => {

    let errors: FormikErrors<CreateSchoolValue> = {};

    // Validate input

    let hasError = false;
    if (values.name === "") {
      errors.name = "Please enter your school name";
      hasError = true;
    }

    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeSchool = await newSchool({
      whole: false,
      name: values.name,
      apiKey: props.apiKey.key,
    });

    if (isApiErrorCode(maybeSchool)) {
      switch (maybeSchool) {
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
      failureResult: "",
      successResult: "School Created"
    });
    // execute callback
    props.postSubmit();
  }

  const normalizeSchoolName = (e: string) => e.toUpperCase().replace(/[^A-Z ]+/g, "").replace(/ +(?= )/g,"");

  return <>
    <Formik<CreateSchoolValue>
      onSubmit={onSubmit}
      initialValues={{
        name: "",
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
              <Form.Control
                name="name"
                type="text"
                placeholder="School Name"
                as="input"
                value={fprops.values.name}
                onChange={e => fprops.setFieldValue("name", normalizeSchoolName(e.target.value))}
                isInvalid={!!fprops.errors.name}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.name}</Form.Control.Feedback>
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

export default UserCreateSchool;
