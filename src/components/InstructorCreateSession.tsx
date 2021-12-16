import SearchMultiUser from '../components/SearchMultiUser';
import SearchSingleCourse from '../components/SearchSingleCourse';
import { Formik, FormikHelpers, FormikErrors } from 'formik';

import { Row, Col, Button, Form } from 'react-bootstrap';
import { CourseData, sessionNew, courseMembershipView, courseDataView } from '../utils/utils';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import { isErr, unwrap, isEmpty } from '@innexgo/frontend-common';
import { ApiKey, userDataView } from '@innexgo/frontend-auth-api';

type CreateSessionProps = {
  start: number;
  end: number;
  postSubmit: () => void;
  apiKey: ApiKey;
}

function CreateSession(props: CreateSessionProps) {
  type CreateSessionValue = {
    start: string,
    end: string,
    name: string,
    courseId: number | null,
    studentList: number[],
  }

  const onSubmit = async (values: CreateSessionValue, fprops: FormikHelpers<CreateSessionValue>) => {
    let errors: FormikErrors<CreateSessionValue> = {};

    if (values.courseId === null) {
      errors.courseId = "Please select a course.";
    }

    const parsedStart = parse(values.start, "hh:mm a", props.start).valueOf();
    const parsedEnd = parse(values.end, "hh:mm a", props.end).valueOf();

    if (isNaN(parsedStart)) {
      errors.start = `Please provide date in "hh:mm am/pm" format`
    }

    if (isNaN(parsedEnd)) {
      errors.end = `Please provide date in "hh:mm am/pm" format`
    }

    fprops.setErrors(errors);
    if (!isEmpty(errors)) {
      return;
    }

    const maybeSessionData = await sessionNew({
      name: values.name,
      courseId: values.courseId!,
      startTime: parsedStart,
      endTime: parsedEnd,
      attendeeUserIds: values.studentList,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeSessionData)) {
      switch (maybeSessionData.Err) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            successResult: "",
            failureResult: "You have been automatically logged out. Please relogin.",
          });
          break;
        }
        case "USER_NONEXISTENT": {
          fprops.setStatus({
            successResult: "",
            failureResult: "You may not have access to one or more of the selected students",
          });
          break;
        }
        case "NEGATIVE_DURATION": {
          fprops.setStatus({
            successResult: "",
            failureResult: "The end you have selected is not valid.",
          });
          break;
        }
        default: {
          fprops.setStatus({
            successResult: "",
            failureResult: "An unknown error has occurred",
          });
          break;
        }
      }
      return;
    }

    let sessionData = maybeSessionData.Ok;

    // if we didn't have an error close it
    props.postSubmit();
  }

  return <>
    <Formik<CreateSessionValue>
      onSubmit={onSubmit}
      initialValues={{
        start: format(props.start, "hh:mm a"),
        end: format(props.end, "hh:mm a"),
        name: "",
        courseId: null,
        studentList: [],
      }}
      initialStatus={{
        failureResult: "",
        successResult: ""
      }}
    >
      {(fprops) => (
        <Form
          noValidate
          onSubmit={fprops.handleSubmit} >
          <Form.Group className="mb-3">
            <Form.Label>Start Time</Form.Label>
            <Form.Control
              name="start"
              type="text"
              placeholder="Start Time (hh:mm am/pm)"
              onChange={fprops.handleChange}
              isInvalid={!!fprops.errors.start}
              value={fprops.values.start}
            />
            <Form.Text className="text-danger">{fprops.errors.start}</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>End Time</Form.Label>
            <Form.Control
              name="end"
              type="text"
              placeholder="End Time (hh:mm am/pm)"
              value={fprops.values.end}
              onChange={fprops.handleChange}
              isInvalid={!!fprops.errors.end}
            />
            <Form.Text className="text-danger">{fprops.errors.end}</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Course</Form.Label>
            <SearchSingleCourse
              name="courseId"
              search={async (input: string) => {
                // get memberships in which i am a teacher
                const courseMemberships = await courseMembershipView({
                  userId: [props.apiKey.creatorUserId],
                  courseMembershipKind: ["INSTRUCTOR"],
                  onlyRecent: true,
                  apiKey: props.apiKey.key,
                })
                  .then(unwrap);

                const courseData = await courseDataView({
                  courseId: courseMemberships.map(cm => cm.course.courseId),
                  partialName: input,
                  onlyRecent: true,
                  apiKey: props.apiKey.key,
                })
                  .then(unwrap);

                return courseData;
              }}
              isInvalid={!!fprops.errors.courseId}
              setFn={(e: CourseData | null) => {
                fprops.setFieldValue("courseId", e?.course.courseId)
                // set student list to blank to ensure students are in the course
                fprops.setFieldValue("studentList", []);
              }} />
            <Form.Text className="text-danger">{fprops.errors.courseId}</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              type="text"
              placeholder="Session Name (optional)"
              value={fprops.values.name}
              onChange={fprops.handleChange}
              isInvalid={!!fprops.errors.name}
            />
            <Form.Text className="text-danger">{fprops.errors.name}</Form.Text>
          </Form.Group>
          <br />
          <Form.Group className="mb-3">
            <Form.Label>Students Invited</Form.Label>
            <SearchMultiUser
              name="studentList"
              disabled={fprops.values.courseId == null}
              isInvalid={!!fprops.errors.studentList}
              search={async (input: string) => {
                const courseMemberships = await courseMembershipView({
                  courseId: [fprops.values.courseId!],
                  courseMembershipKind: ["STUDENT"],
                  onlyRecent: true,
                  apiKey: props.apiKey.key,
                }).then(unwrap);

                const users = await userDataView({
                  creatorUserId: courseMemberships.map(cm => cm.userId).filter(u => !fprops.values.studentList.includes(u)),
                  onlyRecent: true,
                  apiKey: props.apiKey.key,
                }).then(unwrap);

                return users.filter(x => x.name.includes(input));
              }}
              setFn={e => {
                fprops.setFieldValue("studentList", e.map(s => s.creatorUserId));
              }} />
            <Form.Text className="text-danger">{fprops.errors.studentList}</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Button type="submit">Submit</Button>
          </Form.Group>
          <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
        </Form>
      )}
    </Formik>
  </>
}

export default CreateSession;
