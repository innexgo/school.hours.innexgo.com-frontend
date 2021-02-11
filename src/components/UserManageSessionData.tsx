import React from 'react';
import { Form, Button, Table } from 'react-bootstrap'; import Loader from '../components/Loader';
import { Async, AsyncProps } from 'react-async';
import DisplayModal from '../components/DisplayModal';
import { viewSessionData, newSessionData, isApiErrorCode, } from '../utils/utils';
import { ViewUser } from '../components/ViewData';
import { Edit, Archive, Unarchive } from '@material-ui/icons';
import { Formik, FormikHelpers } from 'formik'
import format from 'date-fns/format';


type EditSessionDataProps = {
  sessionData: SessionData,
  apiKey: ApiKey,
  postSubmit: () => void
};

function EditSessionData(props: EditSessionDataProps) {

  type EditSessionDataValue = {
    name: string,
    makePublic: boolean,
  }

  const onSubmit = async (values: EditSessionDataValue,
    fprops: FormikHelpers<EditSessionDataValue>) => {

    const maybeSessionData = await newSessionData({
      sessionId: props.sessionData.session.sessionId,
      name: values.name,
      startTime: props.sessionData.startTime,
      duration: props.sessionData.duration,
      hidden: !values.makePublic,
      active: props.sessionData.active,
      apiKey: props.apiKey.key,
    });

    if (isApiErrorCode(maybeSessionData)) {
      switch (maybeSessionData) {
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
        makePublic: !props.sessionData.hidden
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
            <Form.Check
              name="makePublic"
              checked={fprops.values.makePublic}
              onChange={fprops.handleChange}
              label="Visible to all students"
            />
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


const loadSessionData = async (props: AsyncProps<SessionData>) => {
  const maybeSessionData = await viewSessionData({
    sessionId: props.sessionId,
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeSessionData) || maybeSessionData.length === 0) {
    throw Error;
  } else {
    return maybeSessionData[0];
  }
}


const UserManageSessionData = (props: {
  sessionId: number,
  apiKey: ApiKey,
}) => {

  const [showEditSessionData, setShowEditSessionData] = React.useState(false);

  return <Async
    promiseFn={loadSessionData}
    apiKey={props.apiKey}
    sessionId={props.sessionId}>
    {({ reload }) => <>
      <Async.Pending><Loader /></Async.Pending>
      <Async.Rejected>
        <span className="text-danger">An unknown error has occured.</span>
      </Async.Rejected>
      <Async.Fulfilled<SessionData>>{sessionData => <>
        <Table hover bordered>
          <tbody>
            <tr>
              <th>Time</th>
              <td>{format(sessionData.startTime, "MMM do, h:mm a")} - {format(sessionData.startTime+ sessionData.duration, "h:mm a")}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{sessionData.name}</td>
            </tr>
            <tr>
              <th>Creator</th>
              <td><ViewUser user={sessionData.session.creator} apiKey={props.apiKey} expanded={false} /></td>
            </tr>
            <tr>
              <th>Creation Time</th>
              <td>{format(sessionData.session.creationTime, "MMM do")}</td>
            </tr>
          </tbody>
        </Table>
        <Button variant="secondary" onClick={_ => setShowEditSessionData(true)}>Edit <Edit /></Button>

        <DisplayModal
          title="Edit Session"
          show={showEditSessionData}
          onClose={() => setShowEditSessionData(false)}
          small
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

export default UserManageSessionData;
