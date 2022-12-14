import React from 'react';
import { Form, Button, Table, Spinner } from 'react-bootstrap';
import { DisplayModal } from '@innexgo/common-react-components';
import { Async, AsyncProps } from 'react-async';
import { sessionDataView, sessionDataNew, SessionData } from '../utils/utils';
import { ViewUser } from '../components/ViewData';
import { Pencil as EditIcon, Trash as DeleteIcon, BoxArrowUp as RestoreIcon } from 'react-bootstrap-icons';
import { Formik, FormikHelpers } from 'formik'
import format from 'date-fns/format';

import { isErr, unwrap } from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';

type EditSessionDataProps = {
  sessionData: SessionData,
  apiKey: ApiKey,
  postSubmit: () => void
};

function EditSessionData(props: EditSessionDataProps) {

  type EditSessionDataValue = {
    name: string,
  }

  const onSubmit = async (values: EditSessionDataValue,
    fprops: FormikHelpers<EditSessionDataValue>) => {

    const maybeSessionData = await sessionDataNew({
      sessionId: props.sessionData.session.sessionId,
      name: values.name,
      startTime: props.sessionData.startTime,
      endTime: props.sessionData.endTime,
      active: props.sessionData.active,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeSessionData)) {
      switch (maybeSessionData.Err) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to modify this session.",
            successResult: ""
          });
          break;
        }
        case "SESSION_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This session does not exist.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while modifying session data.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Session Successfully Modified"
    });

    // execute callback
    props.postSubmit();
  }

  return <>
    <Formik<EditSessionDataValue>
      onSubmit={onSubmit}
      initialValues={{
        name: props.sessionData.name,
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
              <Form.Label>Session Name</Form.Label>
              <Form.Control
                name="name"
                type="text"
                placeholder="Session Name"
                as="input"
                value={fprops.values.name}
                onChange={e => fprops.setFieldValue("name", e.target.value)}
                isInvalid={!!fprops.errors.name}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.name}</Form.Control.Feedback>
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


const loadSessionData = async (props: AsyncProps<SessionData>) =>
  unwrap(await sessionDataView({
    sessionId: [props.sessionId],
    onlyRecent: true,
    apiKey: props.apiKey.key
  }))[0];



const InstructorManageSessionData = (props: {
  sessionId: number,
  apiKey: ApiKey,
}) => {

  const [showEditSessionData, setShowEditSessionData] = React.useState(false);

  return <Async
    promiseFn={loadSessionData}
    apiKey={props.apiKey}
    sessionId={props.sessionId}>
    {({ reload }) => <>
      <Async.Pending>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Async.Pending>
      <Async.Rejected>
        <span className="text-danger">An unknown error has occured.</span>
      </Async.Rejected>
      <Async.Fulfilled<SessionData>>{sessionData => <>
        <Table hover bordered>
          <tbody>
            <tr>
              <th>Time</th>
              <td>{format(sessionData.startTime, "MMM do, h:mm a")} - {format(sessionData.endTime, "h:mm a")}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{sessionData.name}</td>
            </tr>
            <tr>
              <th>Creator</th>
              <td><ViewUser userId={sessionData.session.creatorUserId} apiKey={props.apiKey} expanded={false} /></td>
            </tr>
            <tr>
              <th>Creation Time</th>
              <td>{format(sessionData.session.creationTime, "MMM do")}</td>
            </tr>
          </tbody>
        </Table>
        <Button variant="secondary" onClick={_ => setShowEditSessionData(true)}>Edit <EditIcon /></Button>

        <DisplayModal
          title="Edit Session"
          show={showEditSessionData}
          onClose={() => setShowEditSessionData(false)}
        >
          <EditSessionData
            sessionData={sessionData}
            apiKey={props.apiKey}
            postSubmit={() => {
              setShowEditSessionData(false);
              reload();
            }}
          />
        </DisplayModal>
      </>
      }
      </Async.Fulfilled>
    </>}
  </Async>
}

export default InstructorManageSessionData;
