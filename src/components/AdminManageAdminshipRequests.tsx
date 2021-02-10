import React from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import ToggleButton from "react-bootstrap/ToggleButton";
import Loader from '../components/Loader';
import DisplayModal from '../components/DisplayModal';
import { ViewUser, } from '../components/ViewData';

import { Assignment, } from '@material-ui/icons'
import { Formik, FormikHelpers } from 'formik'

import format from "date-fns/format";

import { Async, AsyncProps } from 'react-async';
import { viewAdminshipRequest, newAdminshipRequestResponse, isApiErrorCode } from '../utils/utils';


type ReviewAdminshipRequestProps = {
  adminshipRequest: AdminshipRequest,
  apiKey: ApiKey,
  postSubmit: () => void
};

function ReviewAdminshipRequest(props: ReviewAdminshipRequestProps) {

  type ReviewAdminshipRequestValue = {
    message: string,
    accept: boolean | null
  }

  const onSubmit = async (values: ReviewAdminshipRequestValue,
    fprops: FormikHelpers<ReviewAdminshipRequestValue>) => {

    if (values.accept == null) {
      fprops.setErrors({ accept: "Please select one of the options" });
      return;
    }

    const maybeAdminship = await newAdminshipRequestResponse({
      adminshipRequestId: props.adminshipRequest.adminshipRequestId,
      apiKey: props.apiKey.key,
      accept: values.accept,
      message: values.message
    });

    if (isApiErrorCode(maybeAdminship)) {
      switch (maybeAdminship) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to remove this administrator from this school.",
            successResult: ""
          });
          break;
        }
        case "ADMINSHIP_REQUEST_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This request is invalid.",
            successResult: ""
          });
          break;
        }
        case "ADMINSHIP_REQUEST_RESPONSE_EXISTENT": {
          fprops.setStatus({
            failureResult: "This request has already been resolved.",
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
            failureResult: "An unknown or network error has occured while remove adminship.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Adminship Successfully Reviewed"
    });

    // execute callback
    props.postSubmit();
  }

  return <>
    <Formik<ReviewAdminshipRequestValue>
      onSubmit={onSubmit}
      initialValues={{
        message: "",
        accept: null
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
            <Form.Group>
              <Form.Control
                name="message"
                type="text"
                placeholder="(Optional) Message"
                as="textarea"
                rows={2}
                onChange={fprops.handleChange}
              />
            </Form.Group>
            <br />
            <Form.Group>
              <ToggleButton
                key={0}
                type="radio"
                name="radio"
                value="ACCEPT"
                checked={fprops.values.accept === true}
                onChange={_ => fprops.setFieldValue("accepted", true)}
                className="btn-success"
              > Accept </ToggleButton>
              <ToggleButton
                key={1}
                type="radio"
                name="radio"
                value="REJECT"
                checked={fprops.values.accept === false}
                onChange={_ => fprops.setFieldValue("accepted", false)}
                className="btn-danger"
              > Reject </ToggleButton>
            </Form.Group>
            <br />
            <Button type="submit">Submit</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}


const loadAdminshipRequests = async (props: AsyncProps<AdminshipRequest[]>) => {
  const maybeAdminshipRequests = await viewAdminshipRequest({
    schoolId: props.school.schoolId,
    responded: false,
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeAdminshipRequests)) {
    throw Error;
  } else {
    return maybeAdminshipRequests;
  }
}

type AdminManageAdminshipRequestsProps = {
  school: School,
  apiKey: ApiKey,
}

function AdminManageAdminshipRequests(props: AdminManageAdminshipRequestsProps) {

  const [reviewAdminshipRequest, setReviewAdminshipRequest] = React.useState<AdminshipRequest | null>(null);

  return <>
    <Async promiseFn={loadAdminshipRequests} apiKey={props.apiKey} school={props.school}>
      {({ reload }) => <>
        <Async.Pending><Loader /></Async.Pending>
        <Async.Rejected>
          <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
        </Async.Rejected>
        <Async.Fulfilled<AdminshipRequest[]>>{data => <>
          <Table hover bordered>
            <thead>
              <tr>
                <th>User</th>
                <th>Date Sent</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0
                ? <tr><td colSpan={5} className="text-center">No current requests.</td></tr>
                : data.map((a: AdminshipRequest) =>
                  <tr>
                    <td><ViewUser user={a.creator} apiKey={props.apiKey} expanded={false} /></td>
                    <td>{format(a.creationTime, "MMM do")}</td>
                    <th>
                      <Button variant="link" className="text-dark"
                        onClick={() => setReviewAdminshipRequest(a)}>
                        <Assignment />
                      </Button>
                    </th>
                  </tr>
                )}
            </tbody>
          </Table>
          {reviewAdminshipRequest === null ? <> </> :
            <DisplayModal
              title="Review Request"
              show={reviewAdminshipRequest !== null}
              onClose={() => setReviewAdminshipRequest(null)}
            >
              <ReviewAdminshipRequest {...props}
                adminshipRequest={reviewAdminshipRequest}
                postSubmit={() => {
                  setReviewAdminshipRequest(null);
                  reload();
                }}
              />
            </DisplayModal>
          }
        </>}
        </Async.Fulfilled>
      </>}
    </Async>
  </>
}

export default AdminManageAdminshipRequests;
