import React from 'react'
import SearchMultiUser from '../components/SearchMultiUser';
import { Formik, FormikHelpers } from 'formik';

import { Row, Col, Button, Form } from 'react-bootstrap';
import { newSession, newCommittment, isApiErrorCode } from '../utils/utils';
import format from 'date-fns/format';

type CreateSessionModalProps = {
  start: number;
  duration: number;
  postSubmit: () => void;
  apiKey: ApiKey;
}

function CreateSessionModal(props: CreateSessionModalProps) {
  type CreateSessionValue = {
    name: string,
    makePublic: boolean,
    studentList: number[],
  }

  const onSubmit = async (values: CreateSessionValue, { setStatus }: FormikHelpers<CreateSessionValue>) => {
    if (values.name === "") {
      setStatus({
        name: "Please enter session name",
        studentList: "",
        resultFailure: "",
      });
      return;
    }

    const maybeSession = await newSession({
      name: values.name,
      hostId: props.apiKey.creator.id,
      startTime: props.start,
      duration: props.duration,
      hidden: !values.makePublic,
      apiKey: props.apiKey.key,
    });

    if (isApiErrorCode(maybeSession)) {
      switch (maybeSession) {
        case "API_KEY_NONEXISTENT": {
          setStatus({
            studentList: "",
            name: "",
            resultFailure: "You have been automatically logged out. Please relogin.",
          });
          break;
        }
        case "USER_NONEXISTENT": {
          setStatus({
            studentList: "",
            name: "",
            resultFailure: "Host account does not exist.",
          });
          break;
        }
        case "NEGATIVE_DURATION": {
          setStatus({
            studentList: "",
            name: "",
            resultFailure: "The duration you have selected is not valid.",
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

    for (const studentId of values.studentList) {
      const maybeCommittment = await newCommittment({
        sessionId: maybeSession.sessionId,
        attendeeId: studentId,
        cancellable: values.makePublic,
        apiKey: props.apiKey.key
      });

      // TODO handle all other error codes that are possible
      if (isApiErrorCode(maybeCommittment)) {
        switch (maybeCommittment) {
          case "COMMITTMENT_EXISTENT": {
            // not an error;
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

    // if we didn't have an error close it
    props.postSubmit();
  }

  return <>
    <Formik<CreateSessionValue>
      onSubmit={onSubmit}
      initialValues={{
        name: "",
        studentList: [],
        makePublic: false
      }}
      initialStatus={{
        name: "",
        studentList: "",
        resultFailure: "",
      }}
    >
      {(fprops) => (
        <Form
          noValidate
          onSubmit={fprops.handleSubmit} >
          <Form.Group as={Row}>
            <Form.Label column sm={2}>Start Time</Form.Label>
            <Col>
              <span>{format(props.start, "MMM do, hh:mm a")} </span>
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm={2}>End Time</Form.Label>
            <Col>
              <span>{format(props.start + props.duration, "MMM do, hh:mm a")} </span>
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm={2}>Name</Form.Label>
            <Col>
              <Form.Control
                name="name"
                type="text"
                placeholder="Session Name"
                value={fprops.values.name}
                onChange={fprops.handleChange}
                isInvalid={fprops.status.name !== ""}
              />
              <Form.Text className="text-danger">{fprops.status.name}</Form.Text>
            </Col>
          </Form.Group>
          <br/>
          <Form.Group as={Row}>
            <Form.Label column sm={2}>Students Invited</Form.Label>
            <Col>
              <SearchMultiUser
                name="studentList"
                apiKey={props.apiKey}
                isInvalid={fprops.status.studentList !== ""}
                userKind="STUDENT"
                setFn={e => fprops.setFieldValue("studentList", e)} />
              <Form.Text className="text-danger">{fprops.status.studentList}</Form.Text>
            </Col>
          </Form.Group>
          <Form.Check
            name="makePublic"
            checked={fprops.values.makePublic}
            onChange={fprops.handleChange}
            label="Visible to all students"
          />
          <Button type="submit"> Submit </Button>
          <br />
          <Form.Text className="text-danger">{fprops.status.resultFailure}</Form.Text>
        </Form>
      )}
    </Formik>
  </>
}

export default CreateSessionModal;
