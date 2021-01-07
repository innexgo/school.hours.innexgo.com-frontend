import React from 'react'
import SearchMultiUser from '../components/SearchMultiUser';
import SearchSingleCourse from '../components/SearchSingleCourse';
import { Formik, FormikHelpers } from 'formik';

import { Row, Col, Button, Form } from 'react-bootstrap';
import { newSession, newCommittment, viewCourseMembership, isApiErrorCode } from '../utils/utils';
import format from 'date-fns/format';

type CreateSessionProps = {
  start: number;
  duration: number;
  postSubmit: () => void;
  apiKey: ApiKey;
}

function CreateSession(props: CreateSessionProps) {
  type CreateSessionValue = {
    name: string,
    courseId: number | null,
    makePublic: boolean,
    studentList: number[],
  }

  const [defaultSessionName, setDefaultSessionName] = React.useState(props.apiKey.creator.name);

  const onSubmit = async (values: CreateSessionValue, { setStatus }: FormikHelpers<CreateSessionValue>) => {
    let sessionName: string;

    if (values.name === "") {
      sessionName = defaultSessionName;
    } else {
      sessionName = values.name;
    }

    if (values.courseId == null) {
      setStatus({
        name: "",
        courseId: "Select which course you wish to create this session for.",
        studentList: "",
        resultFailure: "",
      });
      return;
    }

    const maybeSession = await newSession({
      name: sessionName,
      locationId: 0,
      courseId: values.courseId,
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
              name: "",
              courseId: "",
              studentList: "",
              resultFailure: "You have been automatically logged out. Please relogin.",
            });
            break;
          }
          case "API_KEY_UNAUTHORIZED": {
            setStatus({
              name: "",
              courseId: "",
              studentList: "",
              resultFailure: "You are not currently authorized to perform this action.",
            });
            break;
          }
          case "USER_NONEXISTENT": {
            setStatus({
              name: "",
              courseId: "",
              studentList: "This user does not exist.",
              resultFailure: "",
            });
            break;
          }
          case "COURSE_NONEXISTENT": {
            setStatus({
              name: "",
              courseId: "This course does not exist.",
              studentList: "",
              resultFailure: "",
            });
            break;
          }
          default: {
            setStatus({
              name: "",
              courseId: "",
              studentList: "",
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
        courseId: null,
        studentList: [],
        makePublic: false
      }}
      initialStatus={{
        name: "",
        courseId: "",
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
            <Form.Label column sm={2}>Course Name</Form.Label>
            <Col>
              <SearchSingleCourse
                name="courseId"
                search={async (input: string) => {
                  const maybeCourseMemberships = await viewCourseMembership({
                    partialCourseName: input,
                    courseMembershipKind: "STUDENT",
                    userId: props.apiKey.creator.userId,
                    onlyRecent: true,
                    apiKey: props.apiKey.key,
                  });
                  return isApiErrorCode(maybeCourseMemberships) ? [] : maybeCourseMemberships.map(x => x.course)
                }}
                isInvalid={fprops.status.courseId !== ""}
                setFn={(e: Course | null) => {
                  fprops.setFieldValue("courseId", e?.courseId)
                  // set student list to blank to ensure students are in the course
                  fprops.setFieldValue("studentList", []);
                }} />
              <Form.Text className="text-danger">{fprops.status.courseId}</Form.Text>
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm={2}>Name</Form.Label>
            <Col>
              <Form.Control
                name="name"
                type="text"
                placeholder={`${defaultSessionName} (default)`}
                value={fprops.values.name}
                onChange={fprops.handleChange}
                isInvalid={fprops.status.name !== ""}
              />
              <Form.Text className="text-danger">{fprops.status.name}</Form.Text>
            </Col>
          </Form.Group>
          <br />
          <Form.Group as={Row}>
            <Form.Label column sm={2}>Students Invited</Form.Label>
            <Col>
              <SearchMultiUser
                name="studentList"
                disabled={fprops.values.courseId == null}
                isInvalid={fprops.status.studentList !== ""}
                search={async (input: string) => {
                  const maybeCourseMemberships = await viewCourseMembership({
                    courseId: fprops.values.courseId!,
                    courseMembershipKind:"STUDENT",
                    partialUserName: input,
                    apiKey: props.apiKey.key,
                  });
                  return isApiErrorCode(maybeCourseMemberships) ? [] : maybeCourseMemberships.map(x => x.user)
                }}
                setFn={e => {
                  fprops.setFieldValue("studentList", e.map(s => s.userId));
                  let newDefault = props.apiKey.creator.name;
                  for (const s of e) {
                    newDefault += ` - ${s.name}`
                  }
                  setDefaultSessionName(newDefault);
                }} />
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

export default CreateSession;
