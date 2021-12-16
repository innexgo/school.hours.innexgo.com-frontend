import { Async, AsyncProps } from 'react-async';
import { Row, Col, Card, Tabs, Tab, Table, Form, Button, } from 'react-bootstrap';
import { Formik, FormikHelpers, } from 'formik';
import { Loader, Action } from '@innexgo/common-react-components';
import InstructorManageSessionData from '../components/InstructorManageSessionData';
import { ViewSession, ViewUser, ViewSessionRequestResponse } from '../components/ViewData';
import SearchMultiUser from '../components/SearchMultiUser';
import { Committment, Session, CommittmentResponseKind, SessionRequestResponse, CommittmentResponse, commitmentNew, commitmentResponseView, commitmentView, commitmentResponseNew, courseMembershipView, sessionRequestResponseView } from '../utils/utils';
import { X, Check, Clock } from 'react-bootstrap-icons';

import { isErr, unwrap } from '@innexgo/frontend-common';
import { userDataView, ApiKey } from '@innexgo/frontend-auth-api';

type InstructorManageSessionProps = {
  session: Session;
  apiKey: ApiKey;
}

type InstructorManageSessionData = {
  sessionRequestResponses: SessionRequestResponse[],
  commitments: Committment[],
  commitmentResponses: CommittmentResponse[]
}

const loadData = async (props: AsyncProps<InstructorManageSessionData>) => {

  const sessionRequestResponses = await sessionRequestResponseView({
    sessionId: [props.session.sessionId],
    apiKey: props.apiKey.key
  })
    .then(unwrap);


  const commitments = await commitmentView({
    sessionId: [props.session.sessionId],
    responded: false,
    apiKey: props.apiKey.key
  })
    .then(unwrap);


  const commitmentResponses = await commitmentResponseView({
    sessionId: [props.session.sessionId],
    apiKey: props.apiKey.key
  })
    .then(unwrap);

  return {
    sessionRequestResponses,
    commitments,
    commitmentResponses
  };
}

function InstructorManageSession(props: InstructorManageSessionProps) {

  type CreateCommittmentResponseValues = {
    commitment: Committment;
    commitmentResponseKind: CommittmentResponseKind | "default";
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
        <Async.Fulfilled<InstructorManageSessionData>>{data => <>
          <Card>
            <Card.Body>
              <Card.Title>Session</Card.Title>
              <InstructorManageSessionData apiKey={props.apiKey} sessionId={props.session.sessionId} />
            </Card.Body>
          </Card>
          <br />
          {data.sessionRequestResponses.length === 0 ? <> </> :
            <>
              <Card>
                <Card.Body>
                  <Card.Title>Initial Response</Card.Title>
                  <Table>
                    {data.sessionRequestResponses.map(srr =>
                      <tr>
                        <ViewSessionRequestResponse expanded={false} apiKey={props.apiKey} sessionRequestResponse={srr} />
                      </tr>
                    )}
                  </Table>
                </Card.Body>
              </Card>
              <br />
            </>
          }
          <h5>Students Attending</h5>
          <Tabs defaultActiveKey="manage">
            <Tab eventKey="manage" title="Current Students">
              <br />
              <Formik<CreateCommittmentResponseValues[]>
                onSubmit={async (values, { setStatus }: FormikHelpers<CreateCommittmentResponseValues[]>) => {
                  let newStatus = values.map(_ => "");
                  values.forEach(async (individual, i) => {
                    if (individual.commitmentResponseKind === "default") {
                      return;
                    }

                    const maybeCommittmentResponse = await commitmentResponseNew({
                      commitmentId: individual.commitment.commitmentId,
                      commitmentResponseKind: individual.commitmentResponseKind,
                      apiKey: props.apiKey.key,
                    });

                    if (isErr(maybeCommittmentResponse)) {
                      switch (maybeCommittmentResponse.Err) {
                        case "COMMITTMENT_RESPONSE_EXISTENT": {
                          newStatus[i] = "Attendance has already been taken for this commitment.";
                          break;
                        }
                        case "COMMITTMENT_RESPONSE_UNCANCELLABLE": {
                          newStatus[i] = "This commitment cannot be cancelled.";
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
                initialValues={data.commitments.map(c => ({
                  commitment: c,
                  commitmentResponseKind: "default"
                }))}
                initialStatus={data.commitments.map(_ => "")}
              >
                {fprops =>
                  <Form noValidate onSubmit={fprops.handleSubmit}>
                    <Table hover bordered className="mx-2">
                      <thead>
                        <tr><th>Student</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {fprops.values.map((c: CreateCommittmentResponseValues, i: number) =>
                          <tr key={c.commitment.commitmentId}>
                            <td><ViewUser expanded={false} apiKey={props.apiKey} userId={c.commitment.attendeeUserId} /></td>
                            <td>
                              <Form.Select
                                size="sm"
                                onChange={(e) => {
                                  fprops.values[i].commitmentResponseKind = (e.target as HTMLSelectElement).value as (CommittmentResponseKind | "default");
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
                              </Form.Select>
                              <br />
                              <Form.Text className="text-danger">{fprops.status[i]}</Form.Text>
                            </td>
                          </tr>
                        )}
                        {
                          data.commitmentResponses.map((cr: CommittmentResponse) => {
                            let content;
                            switch (cr.kind) {
                              case "ABSENT": {
                                content = <Action title="Absent" icon={X} variant="danger" onClick={() => 1} />;
                                break;
                              }
                              case "TARDY": {
                                content = <Action title="Tardy" icon={Clock} variant="warning" onClick={() => 1} />;
                                break;
                              }
                              case "PRESENT": {
                                content = <Action title="Present" icon={Check} variant="success" onClick={() => 1} />;
                                break;
                              }
                              case "CANCELLED": {
                                content = <Action title="CANCELLED" icon={X} variant="secondary" onClick={() => 1} />;
                                break;
                              }
                            }
                            return <tr>
                              <td><ViewUser expanded={false} apiKey={props.apiKey} userId={cr.commitment.attendeeUserId} /></td>
                              <td>{content}</td>
                            </tr>
                          })
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
                    const maybeCommittment = await commitmentNew({
                      sessionId: props.session.sessionId,
                      attendeeUserId: studentId,
                      apiKey: props.apiKey.key
                    });

                    // TODO handle all other error codes that are possible
                    if (isErr(maybeCommittment)) {
                      switch (maybeCommittment.Err) {
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
                    <Form.Group className="mb-3">
                      <Form.Label>Students Invited</Form.Label>
                      <SearchMultiUser
                        name="studentList"
                        isInvalid={fprops.status.studentList !== ""}
                        search={async (input: string) => {
                          const courseMemberships = await courseMembershipView({
                            courseId: [props.session.course.courseId],
                            courseMembershipKind: ["STUDENT"],
                            onlyRecent: true,
                            apiKey: props.apiKey.key,
                          })
                            .then(unwrap);

                          const users = await userDataView({
                            creatorUserId: courseMemberships.map(cm => cm.userId).filter(u => !fprops.values.studentList.includes(u)),
                            onlyRecent: true,
                            apiKey: props.apiKey.key,
                          }).then(unwrap);

                          return users.filter(x => x.name.includes(input));
                        }}
                        setFn={e => fprops.setFieldValue("studentList", e.map(s => s.creatorUserId))} />
                      <Form.Text className="text-danger">{fprops.status.studentList}</Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Button type="submit">Submit</Button>
                    </Form.Group>
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

export default InstructorManageSession;
