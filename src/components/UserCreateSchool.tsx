import React from "react"
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Button, Form } from "react-bootstrap";
import { schoolNew, normalizeSchoolName } from "../utils/utils";
import {isErr } from '@innexgo/frontend-common';
import {ApiKey} from '@innexgo/frontend-auth-api';
import {AuthenticatedComponentProps} from '@innexgo/auth-react-components';


type UserCreateSchoolProps = {
  apiKey: ApiKey;
  postSubmit: () => void;
}

function UserCreateSchool(props: UserCreateSchoolProps) {

  type CreateSchoolValue = {
    name: string,
    description: string,
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
    if (values.description === "") {
      errors.description = "Please enter a description";
      hasError = true;
    }

    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeSchool = await schoolNew({
      whole: false,
      name: values.name,
      description: values.description,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeSchool)) {
      switch (maybeSchool.Err) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "SUBSCRIPTION_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You don't have a subscription to create a school.",
            successResult: ""
          });
          break;
        }
        case "SUBSCRIPTION_EXPIRED": {
          fprops.setStatus({
            failureResult: "Your subscription has expired.",
            successResult: ""
          });
          break;
        }
        case "SUBSCRIPTION_LIMITED": {
          fprops.setStatus({
            failureResult: "Your subscription does not provide for joining another school.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to create school.",
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

  return <>
    <Formik<CreateSchoolValue>
      onSubmit={onSubmit}
      initialValues={{
        name: "",
        description: "",
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
            <Form.Group >
              <Form.Label>Description</Form.Label>
              <Form.Control
                name="description"
                type="text"
                placeholder="Description"
                as="input"
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

export default UserCreateSchool;
