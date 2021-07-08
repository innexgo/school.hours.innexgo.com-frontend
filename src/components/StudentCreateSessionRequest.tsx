import SearchSingleCourse from "../components/SearchSingleCourse";
import { Formik, FormikHelpers,} from "formik";
import { Row, Col, Button, Form } from "react-bootstrap";
import { SessionRequest, CourseData, sessionRequestNew, courseDataView, courseMembershipView, } from "../utils/utils";
import format from "date-fns/format";
import {isErr, unwrap} from '@innexgo/frontend-common';
import {ApiKey} from '@innexgo/frontend-auth-api';

type StudentCreateSessionRequestProps = {
  start: number;
  end: number;
  apiKey: ApiKey;
  postSubmit: (sr:SessionRequest) => void;
}

function StudentCreateSessionRequest(props: StudentCreateSessionRequestProps) {

  type CreateSessionRequestValue = {
    message: string,
    courseId: number | null,
  }

  const onSubmit = async (values: CreateSessionRequestValue,
    { setErrors, setStatus }: FormikHelpers<CreateSessionRequestValue>) => {


    if (values.courseId == null) {
      setErrors({
        courseId: "Please select a course."
      });
      return;
    }

    const maybeSessionRequest = await sessionRequestNew({
      courseId: values.courseId,
      message: values.message,
      startTime: props.start,
      endTime: props.end,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeSessionRequest)) {
      switch (maybeSessionRequest.Err) {
        case "API_KEY_NONEXISTENT": {
          setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "COURSE_NONEXISTENT": {
          setErrors({
            courseId: "This course does not exist.",
          });
          break;
        }
        case "COURSE_ARCHIVED": {
          setErrors({
            courseId: "This course has been archived.",
          });
          break;
        }
        case "NEGATIVE_DURATION": {
          setStatus({
            failureResult: "The duration you have selected is not valid.",
            successResult: ""
          });
          break;
        }
        default: {
          setStatus({
            failureResult: "An unknown or network error has occurred.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    setStatus({
      failureResult: "",
      successResult: "Request Created",
    });

    props.postSubmit(maybeSessionRequest.Ok);
  }

  return <>
    <Formik<CreateSessionRequestValue>
      onSubmit={onSubmit}
      initialValues={{
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
            <Form.Label column sm={2}>Course Name</Form.Label>
            <Col>
              <SearchSingleCourse
                name="courseId"
                search={async input => {

                  const courseMemberships = await courseMembershipView( {
                      userId: [props.apiKey.creator.userId],
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
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm={2}>Message</Form.Label>
            <Col>
              <Form.Control
                name="message"
                type="text"
                placeholder="Message"
                as="textarea"
                rows={3}
                onChange={fprops.handleChange}
                isInvalid={!!fprops.errors.message}
              />
              <Form.Text className="text-danger">{fprops.errors.message}</Form.Text>
            </Col>
          </Form.Group>
          <Button type="submit"> Submit </Button>
          <br />
          <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          <br />
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      )}
    </Formik>
  </>
}

export default StudentCreateSessionRequest;
