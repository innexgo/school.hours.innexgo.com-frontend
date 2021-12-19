import { Async, AsyncProps } from 'react-async';
import { Row, Col, Card, Tabs, Tab, Table, Form, Button, } from 'react-bootstrap';
import { Formik, FormikHelpers, } from 'formik';
import { Loader, Action } from '@innexgo/common-react-components';
import InstructorManageSessionData from '../components/InstructorManageSessionData';
import { ViewSession, ViewUser, ViewSessionRequestResponse } from '../components/ViewData';
import SearchMultiUser from '../components/SearchMultiUser';
import { Commitment, Session, SessionRequestResponse, commitmentNew, commitmentView, courseMembershipView, sessionRequestResponseView } from '../utils/utils';
import { X, Check, Clock } from 'react-bootstrap-icons';

import { isErr, unwrap } from '@innexgo/frontend-common';
import { userDataView, ApiKey } from '@innexgo/frontend-auth-api';

type InstructorManageSessionProps = {
  session: Session;
  apiKey: ApiKey;
}

type InstructorManageSessionData = {
  sessionRequestResponses: SessionRequestResponse[],
  commitments: Commitment[],
}

const loadData = async (props: AsyncProps<InstructorManageSessionData>) => {

  const sessionRequestResponses = await sessionRequestResponseView({
    sessionId: [props.session.sessionId],
    apiKey: props.apiKey.key
  })
    .then(unwrap);


  const commitments = await commitmentView({
    sessionId: [props.session.sessionId],
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);


  return {
    sessionRequestResponses,
    commitments,
  };
}

function InstructorManageSession(props: InstructorManageSessionProps) {

  type CreateCommitmentResponseValues = {
    commitment: Commitment;
    commitmentResponseKind: CommitmentResponseKind | "default";
  }

  type CreateCommitmentValues = {
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
            <Tab eventKey="manage" title="Current Students" className="pt-3">
            
            </Tab>
            <Tab eventKey="create" title="Add Students">
              <br />
              <Formik<CreateCommitmentValues>
                onSubmit={async (values: CreateCommitmentValues, { setStatus }: FormikHelpers<CreateCommitmentValues>) => {
                  const maybeCommitment = await commitmentNew({
                    sessionId: props.session.sessionId,
                    attendeeUserIds: values.studentList,
                    active: true,
                    apiKey: props.apiKey.key
                  });

                  // TODO handle all other error codes that are possible
                  if (isErr(maybeCommitment)) {
                    switch (maybeCommitment.Err) {
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
