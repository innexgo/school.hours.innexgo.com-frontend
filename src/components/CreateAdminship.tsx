import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Button, Form } from "react-bootstrap";
import { adminshipNewKey, Adminship } from "../utils/utils";
import { isErr } from '@innexgo/frontend-common';
import { ApiKey, } from '@innexgo/frontend-auth-api';

type UserCreateAdminshipProps = {
  apiKey: ApiKey;
  postSubmit: (a: Adminship) => void;
}


function CreateAdminship(props: UserCreateAdminshipProps) {

  type CreateAdminshipValue = {
    key: string,
  }

  const onSubmit = async (values: CreateAdminshipValue,
    fprops: FormikHelpers<CreateAdminshipValue>) => {

    let errors: FormikErrors<CreateAdminshipValue> = {};

    // Validate input

    let hasError = false;
    if (values.key === "") {
      errors.key = "Please enter a school key";
      hasError = true;
    }

    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeAdminship = await adminshipNewKey({
      schoolKeyKey: values.key,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeAdminship)) {
      switch (maybeAdminship.Err) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You don't have the ability to join this school.",
            successResult: ""
          });
          break;
        }
        case "SCHOOL_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This key is invalid.",
            successResult: ""
          });
          break;
        }
        case "SCHOOL_KEY_EXPIRED": {
          fprops.setStatus({
            failureResult: "This key has expired.",
            successResult: ""
          });
          break;
        }
        case "SCHOOL_KEY_USED": {
          fprops.setStatus({
            failureResult: "This key has already been used.",
            successResult: ""
          });
          break;
        }
        case "SCHOOL_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This school does not exist",
            successResult: ""
          });
          break;
        }
        case "SUBSCRIPTION_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You do not have a subscription to administer a school.",
            successResult: ""
          });
          break;
        }
        case "SUBSCRIPTION_LIMITED": {
          fprops.setStatus({
            failureResult: "Your subscription does not provide for administering this many schools.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to join school.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Adminship Created"
    });
    // execute callback
    props.postSubmit(maybeAdminship.Ok);
  }

  const normalizeKey = (e: string) => e.replace(/[^(A-Za-z0-9_=\-)]/g, "");

  return <>
    <Formik<CreateAdminshipValue>
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
              <Form.Label>School Key</Form.Label>
              <Form.Control
                name="key"
                type="text"
                placeholder="School Key"
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

export default CreateAdminship;
