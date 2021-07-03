import SearchMultiUser from '../components/SearchMultiUser';
import SearchSingleCourse from '../components/SearchSingleCourse';
import { Formik, FormikHelpers } from 'formik';

import { Row, Col, Button, Form } from 'react-bootstrap';
import { CourseData, sessionNew, committmentNew, courseMembershipView, courseDataView} from '../utils/utils';
import format from 'date-fns/format';
import {isErr} from '@innexgo/frontend-common';
import {ApiKey, User} from '@innexgo/frontend-auth-api';

type CreateSessionProps = {
  start: number;
  end: number;
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

  const onSubmit = async (values: CreateSessionValue, { setStatus }: FormikHelpers<CreateSessionValue>) => {
    let sessionName: string;

    sessionName = values.name;

    if (values.courseId == null) {
      setStatus({
        name: "",
        courseId: "Select which course you wish to create this session for.",
        studentList: "",
        resultFailure: "",
      });
      return;
    }

    const maybeSession = await sessionNew({
      name: sessionName,
      courseId: values.courseId,
      startTime: props.start,
      endTime: props.end,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeSession)) {
      switch (maybeSession.Err) {
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
            resultFailure: "The end you have selected is not valid.",
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

    let session = maybeSession.Ok;

    for (const studentId of values.studentList) {
      const maybeCommittment = await committmentNew({
        sessionId: session.sessionId,
        attendeeUserId: studentId,
        apiKey: props.apiKey.key
      });

      // TODO handle all other error codes that are possible
      if (isErr(maybeCommittment)) {
        switch (maybeCommittment.Err) {
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
              <span>{format(props.end, "MMM do, hh:mm a")} </span>
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm={2}>Course</Form.Label>
            <Col>
              <SearchSingleCourse
                name="courseId"
                search={async (input: string) => {
                 const maybeCourseData = await courseDataView({
                    recentMemberUserId: props.apiKey.creator.userId,
                    partialName: input,
                    onlyRecent: true,
                    apiKey: props.apiKey.key,
                  });

                  return isErr(maybeCourseData) ? [] : maybeCourseData;
                }}
                isInvalid={fprops.status.courseId !== ""}
                setFn={(e: CourseData | null) => {
                  fprops.setFieldValue("courseId", e?.course.courseId)
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
                placeholder="Session Name (optional)"
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
                  const maybeCourseMemberships = await courseMembershipView({
                    courseId: [fprops.values.courseId!],
                    courseMembershipKind: ["STUDENT"],
                    partialUserName: input,
                    onlyRecent:true,
                    apiKey: props.apiKey.key,
                  });
                  return isErr(maybeCourseMemberships)
                    ? []
                    : maybeCourseMemberships
                        .map(cm => cm.user)
                        .filter(u => !fprops.values.studentList.includes(u.userId))
                }}
                setFn={e => {
                  fprops.setFieldValue("studentList", e.map(s => s.userId));
                }} />
              <Form.Text className="text-danger">{fprops.status.studentList}</Form.Text>
            </Col>
          </Form.Group>
          <Button type="submit"> Submit </Button>
          <br />
          <Form.Text className="text-danger">{fprops.status.resultFailure}</Form.Text>
        </Form>
      )}
    </Formik>
  </>
}

export default CreateSession;
