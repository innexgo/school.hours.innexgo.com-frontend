import React from 'react';
import { Button, Form } from "react-bootstrap";
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { newValidAdminship, isApiErrorCode } from '../utils/utils';

type CreateAdminshipProps = {
  adminshipRequestResponse: AdminshipRequestResponse;
  apiKey: ApiKey;
  postSubmit: (adminship:Adminship) => void;
}

function CreateAdminship(props: CreateAdminshipProps) {
  type CreateAdminshipValue = {}

  const onSubmit = async (values: CreateAdminshipValue,
    fprops: FormikHelpers<CreateAdminshipValue>) => {

    let errors: FormikErrors<CreateAdminshipValue> = {};
    // Validate input

    let hasError = false;
    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeAdminship = await newValidAdminship({
      adminshipRequestResponseId: props.adminshipRequestResponse.adminshipRequest.adminshipRequestId,
      apiKey: props.apiKey.key,
    });

    if (isApiErrorCode(maybeAdminship)) {
      switch (maybeAdminship) {
        case "ADMINSHIP_REQUEST_RESPONSE_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "Adminship request response does not exist.",
            successResult: ""
          });
          break;
        }
        case "ADMINSHIP_REQUEST_RESPONSE_INVALID": {
          fprops.setStatus({
            failureResult: "Adminship request response is not accepted.",
            successResult: ""
          });
          break;
        }
        case "ADMINSHIP_REQUEST_RESPONSE_CANNOT_USE_OTHERS": {
          fprops.setStatus({
            failureResult: "Adminship request response does not belong to you.",
            successResult: ""
          });
          break;
        }
        case "SCHOOL_ARCHIVED": {
          fprops.setStatus({
            failureResult: "This school has been archived.",
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
            failureResult: "An unknown or network error has occured while trying to add school.",
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
    props.postSubmit(maybeAdminship);
  }

  return <>
    <Formik<CreateAdminshipValue>
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
            <Button type="submit">Accept Invitation</Button>
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
