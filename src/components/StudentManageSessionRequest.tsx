import React from "react"
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Tab, Tabs, Button, Form } from "react-bootstrap";
import { newRejectSessionRequestResponse, isApiErrorCode } from "../utils/utils";
import { ViewSessionRequest } from "../components/ViewData";

type StudentManageSessionRequestProps = {
  apiKey: ApiKey;
  sessionRequest: SessionRequest;
  postSubmit: () => void;
}

// TODO we need to ensure that the abbreviation is truly unique between schools

function StudentManageSessionRequest(props: StudentManageSessionRequestProps) {

  type CancelRequestValue = {
    confirm: boolean,
  }

  const onSubmit = async (values: CancelRequestValue,
    fprops: FormikHelpers<CancelRequestValue>) => {

    let errors: FormikErrors<CancelRequestValue> = {};

    // Validate input

    let hasError = false;
    if (!values.confirm) {
      errors.confirm = "Please confirm cancel request.";
      hasError = true;
    }

    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeSchool = await newRejectSessionRequestResponse({
      sessionRequestId: props.sessionRequest.sessionRequestId,
      message: "",
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
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to perform this action.",
            successResult: ""
          });
          break;
        }
        case "SESSION_REQUEST_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This request is invalid.",
            successResult: ""
          });
          break;
        }
        case "SESSION_REQUEST_RESPONSE_EXISTENT": {
          fprops.setStatus({
            failureResult: "This request has already been resolved.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to cancel.",
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

  return <Tabs>
    <Tab title="View Request" eventKey="view" className="pt-4">
      <ViewSessionRequest sessionRequest={props.sessionRequest} expanded />
    </Tab>
    <Tab title="Cancel Request" eventKey="cancel" className="pt-4">
      <Formik<CancelRequestValue>
        onSubmit={onSubmit}
        initialValues={{
          confirm: false,
        }}
        initialStatus={{
          failureResult: "",
          successResult: ""
        }}
      >
        {(fprops) => <Form
          noValidate
          onSubmit={fprops.handleSubmit} >
          <div hidden={fprops.status.successResult !== ""}>
            <Form.Group >
              <Form.Check
                name="confirm"
                checked={fprops.values.confirm}
                onChange={fprops.handleChange}
                label="Confirm cancel request"
                isInvalid={!!fprops.errors.confirm}
                feedback={fprops.errors.confirm}
              />
            </Form.Group>
            <Button type="submit">Submit Form</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>}
      </Formik>
    </Tab>
  </Tabs>
}

export default StudentManageSessionRequest;
