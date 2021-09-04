import SearchSingleCourse from "../components/SearchSingleCourse";
import { Formik, FormikHelpers, FormikErrors } from "formik";
import { Button, Form } from "react-bootstrap";
import { SessionRequest, CourseData, sessionRequestNew, courseDataView, courseMembershipView, } from "../utils/utils";
import format from "date-fns/format";
import parse from "date-fns/parse";
import { isErr, isEmpty, unwrap } from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';

type StudentCreateSessionRequestProps = {
  start: number;
  end: number;
  apiKey: ApiKey;
  postSubmit: (sr: SessionRequest) => void;
}

function StudentCreateSessionRequest(props: StudentCreateSessionRequestProps) {

  type CreateSessionRequestValue = {
    start: string,
    end: string,
    message: string,
    courseId: number | null,
  }

  const onSubmit = async (values: CreateSessionRequestValue, fprops: FormikHelpers<CreateSessionRequestValue>) => {

    let errors: FormikErrors<CreateSessionRequestValue> = {};

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

    const maybeSessionRequest = await sessionRequestNew({
      courseId: values.courseId!,
      message: values.message,
      startTime: parsedStart,
      endTime: parsedEnd,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeSessionRequest)) {
      switch (maybeSessionRequest.Err) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "COURSE_NONEXISTENT": {
          fprops.setErrors({
            courseId: "This course does not exist.",
          });
          break;
        }
        case "COURSE_ARCHIVED": {
          fprops.setErrors({
            courseId: "This course has been archived.",
          });
          break;
        }
        case "NEGATIVE_DURATION": {
          fprops.setErrors({
            end: "The end time must be after the start time.",
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occurred.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Request Created",
    });

    props.postSubmit(maybeSessionRequest.Ok);
  }

  return <>
    <Formik<CreateSessionRequestValue>
      onSubmit={onSubmit}
      initialValues={{
        start: format(props.start, "hh:mm a"),
        end: format(props.end, "hh:mm a"),
        message: "",
        courseId: null
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
            <Form.Label>Course Name</Form.Label>
            <SearchSingleCourse
              name="courseId"
              search={async input => {
                const courseMemberships = await courseMembershipView({
                  userId: [props.apiKey.creatorUserId],
                  courseMembershipKind: ["STUDENT"],
                  onlyRecent: true,
                  apiKey: props.apiKey.key,
                })
                  .then(unwrap);

                const courseData = await courseDataView({
                  courseId: courseMemberships.map(cm => cm.course.courseId),
                  partialName: input,
                  onlyRecent: true,
                  active: true,
                  apiKey: props.apiKey.key,
                })
                  .then(unwrap);

                return courseData;
              }}
              isInvalid={!!fprops.errors.courseId}
              setFn={(e: CourseData | null) => fprops.setFieldValue("courseId", e?.course.courseId)} />
            <Form.Text className="text-danger">{fprops.errors.courseId}</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Message</Form.Label>
            <Form.Control
              name="message"
              type="text"
              placeholder="Message"
              as="textarea"
              value={fprops.values.message}
              rows={3}
              onChange={fprops.handleChange}
              isInvalid={!!fprops.errors.message}
            />
            <Form.Text className="text-danger">{fprops.errors.message}</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Button type="submit">Submit</Button>
          </Form.Group>
          <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          <br />
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      )}
    </Formik>
  </>
}

export default StudentCreateSessionRequest;
