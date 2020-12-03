import React from "react";
import { Async, AsyncProps } from 'react-async';
import { Row, Col, Card, Tabs, Tab, Table, Form, Button, } from 'react-bootstrap';
import { Formik, FormikHelpers } from 'formik';
import Loader from '../components/Loader';
import { ViewSession, ViewUser } from '../components/ViewData';
import SearchMultiUser from '../components/SearchMultiUser';
import { newCommittment, newCommittmentResponse, viewCommittment, viewCommittmentResponse, isApiErrorCode } from '../utils/utils';

type ManageSessionModalProps = {
  session: Session;
  apiKey: ApiKey;
}

type UserManageSessionData = {
  committments: Committment[],
  committmentResponses: CommittmentResponse[]
}

const loadData = async (props: AsyncProps<UserManageSessionData>) => {
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
  return {
    committments: maybeCommittments,
    committmentResponses: maybeCommittmentResponses
  };
}

function ManageSessionModal(props: ManageSessionModalProps) {

  type CreateCommittmentResponseValues = {
    committmentResponseKind: CommittmentResponseKind | "default"
  }

  type CreateCommittmentValues = {
    studentList: number[]
  }

  return <>
    <Async promiseFn={loadData} apiKey={props.apiKey} session={props.session}>
      {({ reload }) => <>
        <Async.Pending><Loader /></Async.Pending>
        <Async.Rejected>
          <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
        </Async.Rejected>
        <Async.Fulfilled<UserManageSessionData>>{data => <>
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
                  {data.committments.map((c: Committment) => <tr key={c.committmentId}>
                    <td><ViewUser expanded={false} user={c.attendee} /></td>
                    <td>
                      <Formik<CreateCommittmentResponseValues>
                        onSubmit={async (values, { setStatus }: FormikHelpers<CreateCommittmentResponseValues>) => {

                          if (values.committmentResponseKind === "default") {
                            setStatus("Please Select an Attendance");
                            return;
                          }

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
                          reload();
                        }}
                        initialValues={{
                          committmentResponseKind: "default"
                        }}
                        initialStatus=""
                      >
                        {(fprops) => <Form
                          noValidate
                          onSubmit={fprops.handleSubmit} >
                          <Row>
                            <Form.Group as={Col}>
                              <Form.Control
                                as="select"
                                size="sm"
                                custom
                                name="committmentResponseKind"
                                onChange={fprops.handleChange}
                                placeholder="Message"
                                isInvalid={fprops.status !== ""}
                              >
                                <option value="default">Select</option>
                                <option value="PRESENT">Present</option>
                                <option value="TARDY">Tardy</option>
                                <option value="ABSENT">Absent</option>
                                <option value="CANCELLED">Cancel</option>
                              </Form.Control>
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Button size="sm" type="submit" className="float-right">Submit</Button>
                            </Form.Group>
                          </Row>
                          <Form.Text className="text-danger">{fprops.status}</Form.Text>
                        </Form>}
                      </Formik>
                    </td>
                  </tr>)}
                  {data.committmentResponses.map((cr: CommittmentResponse) => <tr>
                    <td><ViewUser expanded={false} user={cr.committment.attendee} /></td>
                    <td>{cr.kind}</td>
                  </tr>)}
                </tbody>
              </Table>
            </Tab>
            <Tab eventKey="create" title="Add Students">
              <br />
              <Formik<CreateCommittmentValues>
                onSubmit={async (values: CreateCommittmentValues, { setStatus }: FormikHelpers<CreateCommittmentValues>) => {
                  for (const studentId of values.studentList) {
                    const maybeCommittment = await newCommittment({
                      sessionId: props.session.sessionId,
                      attendeeId: studentId,
                      cancellable: !props.session.hidden,
                      apiKey: props.apiKey.key
                    });

                    // TODO handle all other error codes that are possible
                    if (isApiErrorCode(maybeCommittment)) {
                      switch (maybeCommittment) {
                        case "COMMITTMENT_EXISTENT": {
                          // Committment existent is actually OK, we don't have to make an error
                          continue;
                        }
                        case "API_KEY_NONEXISTENT": {
                          setStatus({
                            studentList: "",
                            name: "",
                            resultFailure: "You have been automatically logged out. Please relogin.",
                          });
                          break;
                        }
                        case "API_KEY_UNAUTHORIZED": {
                          setStatus({
                            studentList: "",
                            name: "",
                            resultFailure: "You are not currently authorized to perform this action.",
                          });
                          break;
                        }
                        case "USER_NONEXISTENT": {
                          setStatus({
                            studentList: "This user does not exist.",
                            name: "",
                            resultFailure: "",
                          });
                          break;
                        }
                        default: {
                          setStatus({
                            studentList: "",
                            name: "",
                            resultFailure: "An unknown error has occurred",
                          });
                          break;
                        }
                      }
                      return;
                    }
                  }
                  reload();
                }}
                initialValues={{
                  studentList: [],
                }}
                initialStatus={{
                  studentList: "",
                  resultFailure: "",
                }}
              >
                {(fprops) => (
                  <Form
                    noValidate
                    onSubmit={fprops.handleSubmit} >
                    <Form.Group as={Row}>
                      <Form.Label column sm={2}>Students Invited</Form.Label>
                      <Col>
                        <SearchMultiUser
                          name="studentList"
                          apiKey={props.apiKey}
                          isInvalid={fprops.status.studentList !== ""}
                          userKind="STUDENT"
                          setFn={e => fprops.setFieldValue("studentList", e.map(s => s.id))} />
                        <Form.Text className="text-danger">{fprops.status.studentList}</Form.Text>
                      </Col>
                    </Form.Group>
                    <Button type="submit"> Submit </Button>
                    <br />
                    <Form.Text className="text-danger">{fprops.status.resultFailure}</Form.Text>
                  </Form>
                )}
              </Formik>
            </Tab>
          </Tabs>
        </>}
        </Async.Fulfilled>
      </>}
    </Async>
  </>
}

export default ManageSessionModal;
