import React from "react";
import { Async, AsyncProps } from 'react-async';
import { Row, Col, Card, Tabs, Tab, Table, Form, Button, } from 'react-bootstrap';
import { Formik, FormikHelpers, } from 'formik';
import Loader from '../components/Loader';
import { ViewSession, ViewUser } from '../components/ViewData';
import SearchMultiUser from '../components/SearchMultiUser';
import { newCommittment, newCommittmentResponse, viewCommittment, viewCommittmentResponse, viewCourseMembership, isApiErrorCode } from '../utils/utils';

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
    committment: Committment;
    committmentResponseKind: CommittmentResponseKind | "default";
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
              <Formik<CreateCommittmentResponseValues[]>
                onSubmit={async (values, { setStatus }: FormikHelpers<CreateCommittmentResponseValues[]>) => {
                  let newStatus = values.map(_ => "");
                  values.forEach(async (individual, i) => {
                    if (individual.committmentResponseKind === "default") {
                      return;
                    }

                    const maybeCommittmentResponse = await newCommittmentResponse({
                      committmentId: individual.committment.committmentId,
                      committmentResponseKind: individual.committmentResponseKind,
                      apiKey: props.apiKey.key,
                    });

                    if (isApiErrorCode(maybeCommittmentResponse)) {
                      switch (maybeCommittmentResponse) {
                        case "COMMITTMENT_RESPONSE_EXISTENT": {
                          newStatus[i] = "Attendance has already been taken for this committment.";
                          break;
                        }
                        case "COMMITTMENT_RESPONSE_UNCANCELLABLE": {
                          newStatus[i] = "This committment cannot be cancelled.";
                          break;
                        }
                        case "API_KEY_NONEXISTENT": {
                          newStatus[i] = "You have been automatically logged out. Please relogin.";
                          break;
                        }
                        case "API_KEY_UNAUTHORIZED": {
                          newStatus[i] = "You are not currently authorized to perform this action.";
                          break;
                        }
                        default: {
                          newStatus[i] = "An unknown or network error has occurred.";
                          break;
                        }
                      }
                    }
                  });
                  setStatus(newStatus);
                  reload();
                }}
                initialValues={data.committments.map(c => ({
                  committment: c,
                  committmentResponseKind: "default"
                }))}
                initialStatus={data.committments.map(_ => "")}
              >
                {fprops =>
                  <Form noValidate onSubmit={fprops.handleSubmit} >
                    <Table hover bordered>
                      <thead>
                        <tr><th>Student</th><th>Attendance Status</th></tr>
                      </thead>
                      <tbody>
                        {fprops.values.map((c: CreateCommittmentResponseValues, i: number) =>
                          <tr key={c.committment.committmentId}>
                            <td><ViewUser expanded={false} user={c.committment.attendee} /></td>
                            <td>
                              <Form.Control
                                as="select"
                                size="sm"
                                custom
                                onChange={(e) => {
                                  fprops.values[i].committmentResponseKind = e.target.value as (CommittmentResponseKind | "default");
                                  fprops.setValues(fprops.values)
                                }}
                                placeholder="Message"
                                isInvalid={fprops.status[i] !== ""}
                              >
                                <option value="default">Select</option>
                                <option value="PRESENT">Present</option>
                                <option value="TARDY">Tardy</option>
                                <option value="ABSENT">Absent</option>
                                <option value="CANCELLED">Cancel</option>
                              </Form.Control>
                              <br />
                              <Form.Text className="text-danger">{fprops.status[i]}</Form.Text>
                            </td>
                          </tr>
                        )}
                        {
                          data.committmentResponses.map((cr: CommittmentResponse) => <tr>
                            <td><ViewUser expanded={false} user={cr.committment.attendee} /></td>
                            <td>{cr.kind}</td>
                          </tr>)
                        }
                      </tbody>
                    </Table>
                    <Button type="submit">Submit</Button>
                  </Form>}
              </Formik>
            </Tab>
            <Tab eventKey="create" title="Add Students">
              <br />
              <Formik<CreateCommittmentValues>
                onSubmit={async (values: CreateCommittmentValues, { setStatus }: FormikHelpers<CreateCommittmentValues>) => {
                  for (const studentId of values.studentList) {
                    const maybeCommittment = await newCommittment({
                      sessionId: props.session.sessionId,
                      attendeeUserId: studentId,
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
                          isInvalid={fprops.status.studentList !== ""}
                          search={async (input: string) => {
                            const maybeCourseMemberships = await viewCourseMembership({
                              courseId: props.session.course.courseId,
                              courseMembershipKind: "STUDENT",
                              partialUserName: input,
                              apiKey: props.apiKey.key,
                            });
                            return isApiErrorCode(maybeCourseMemberships) ? [] : maybeCourseMemberships.map(x => x.user)
                          }}
                          setFn={e => fprops.setFieldValue("studentList", e.map(s => s.userId))} />
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
