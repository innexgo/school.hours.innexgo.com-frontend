import React from "react";
import { Async } from 'react-async';
import { Row, Col, Card, Tabs, Tab, Table, Form, Button, ToggleButton } from 'react-bootstrap';
import { Formik, FormikHelpers } from 'formik';
import Loader from '../components/Loader';
import { ViewSession, ViewUser } from '../components/ViewData';
import { newCommittment, newCommittmentResponse, viewCommittment, viewCommittmentResponse, isApiErrorCode } from '../utils/utils';

type ManageSessionModalProps = {
  session: Session;
  apiKey: ApiKey;
}

const loadData = async (props: ManageSessionModalProps) => {
  if (props == null) {
    throw Error
  }
  const maybeCommittments = await viewCommittment({
    sessionId: props.session.sessionId,
    responded: false,
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeCommittments)) {
    throw Error;
  }

  const maybeCommittmentResponses = await viewCommittmentResponse({
    sessionId: props.session.sessionId,
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeCommittmentResponses)) {
    throw Error;
  }
  return [maybeCommittments, maybeCommittmentResponses];
}

function ManageSessionModal(props: ManageSessionModalProps) {

  const [refresh, doRefresh] = React.useState(false);

  type CreateCommittmentResponseValues = {
    committmentResponseKind: CommittmentResponseKind
  }

  return <>
    <Async promise={loadData(props)}>
      <Async.Pending><Loader /></Async.Pending>
      <Async.Rejected>
        <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
      </Async.Rejected>
      <Async.Fulfilled<[Committment[], CommittmentResponse[]]>>{data => <>
        <Card>
          <Card.Body>
            <Card.Title>Session</Card.Title>
            <ViewSession expanded session={props.session} />
          </Card.Body>
        </Card>
        <br />
        <h5>Students Attending</h5>
        <Tabs defaultActiveKey="manage">
          <Tab eventKey="manage" title="Current Students">
            <br />
            <Table hover bordered>
              <thead>
                <tr><th>Student</th><th>Attendance Status</th></tr>
              </thead>
              <tbody>
                {data[0].map((c: Committment) => <tr>
                  <td><ViewUser expanded={false} user={c.attendee} /></td>
                  <td>
                    <Formik<CreateCommittmentResponseValues>
                      onSubmit={async (values, { setStatus }: FormikHelpers<CreateCommittmentResponseValues>) => {
                        console.log("NIIIICE");
                        const maybeCommittmentResponse = await newCommittmentResponse({
                          committmentId: c.committmentId,
                          committmentResponseKind: values.committmentResponseKind,
                          apiKey: props.apiKey.key,
                        });

                        if (isApiErrorCode(maybeCommittmentResponse)) {
                          switch (maybeCommittmentResponse) {
                            case "COMMITTMENT_RESPONSE_EXISTENT": {
                              setStatus("Attendance has already been taken");
                              break;
                            }
                            case "COMMITTMENT_RESPONSE_UNCANCELLABLE": {
                              setStatus("This committment cannot be cancelled.");
                              break;
                            }
                            case "API_KEY_NONEXISTENT": {
                              setStatus("You have been automatically logged out. Please relogin.");
                              break;
                            }
                            case "API_KEY_UNAUTHORIZED": {
                              setStatus("You are not currently authorized to perform this action.");
                              break;
                            }
                            default: {
                              setStatus("An unknown or network error has occurred.");
                              break;
                            }
                          }
                          return;
                        }
                        // TODO
                        doRefresh(!refresh);
                      }}
                      initialValues={{
                        committmentResponseKind: "PRESENT"
                      }}
                      initialStatus=""
                    >
                      {(fprops) => <Form
                        noValidate
                        as={Row}
                        onSubmit={fprops.handleSubmit} >
                        <Form.Group as={Col}>
                          <Form.Control
                            as="select"
                            size="sm"
                            name="committmentResponseKind"
                            onChange={fprops.handleChange}
                            placeholder="Message"
                            isInvalid={fprops.status !== ""}
                          >
                            <option value="PRESENT">Present</option>
                            <option value="TARDY">Tardy</option>
                            <option value="ABSENT">Absent</option>
                            <option value="CANCELLED">Cancel</option>
                          </Form.Control>
                        </Form.Group>
                        <Form.Group as={Col}>
                          <Button size="sm" type="submit" className="float-right">Submit</Button>
                        </Form.Group>
                        <Form.Text className="text-danger">{fprops.status}</Form.Text>
                      </Form>}
                    </Formik>
                  </td>
                </tr>)}
                {data[1].map((cr: CommittmentResponse) => <tr>
                  <td><ViewUser expanded={false} user={cr.committment.attendee} /></td>
                  <td>{cr.kind}</td>
                </tr>)}
              </tbody>
            </Table>
          </Tab>
          <Tab eventKey="create" title="Add Students">
          </Tab>
        </Tabs>
      </>}
      </Async.Fulfilled>
    </Async>
  </>
}

export default ManageSessionModal;
