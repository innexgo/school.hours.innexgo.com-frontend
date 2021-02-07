import React from "react"
import SearchSingleCourse from "../components/SearchSingleCourse";
import { Formik, FormikHelpers } from "formik";
import { Row, Col, Button, Form } from "react-bootstrap";
import { newSessionRequest, viewCourseData, isApiErrorCode } from "../utils/utils";
import format from "date-fns/format";

type StudentCreateSessionRequestProps = {
  start: number;
  duration: number;
  apiKey: ApiKey;
  postSubmit: () => void;
}

function StudentCreateSessionRequest(props: StudentCreateSessionRequestProps) {

  type CreateSessionRequestValue = {
    message: string,
    courseId: number | null,
  }

  const onSubmit = async (values: CreateSessionRequestValue,
    { setStatus }: FormikHelpers<CreateSessionRequestValue>) => {

    if (values.courseId == null) {
      setStatus({
        courseId: "Please select a course.",
        message: "",
        failureResult: "",
      });
      return;
    }

    const maybeSessionRequest = await newSessionRequest({
      courseId: values.courseId,
      message: values.message,
      startTime: props.start,
      duration: props.duration,
      apiKey: props.apiKey.key,
    });

    if (isApiErrorCode(maybeSessionRequest)) {
      switch (maybeSessionRequest) {
        case "API_KEY_NONEXISTENT": {
          setStatus({
            message: "",
            courseId: "",
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "USER_NONEXISTENT": {
          setStatus({
            message: "",
            courseId: "This teacher does not exist.",
            failureResult: "",
            successResult: ""
          });
          break;
        }
        case "NEGATIVE_DURATION": {
          setStatus({
            message: "",
            courseId: "",
            failureResult: "The duration you have selected is not valid.",
            successResult: ""
          });
          break;
        }
        default: {
          setStatus({
            message: "",
            courseId: "",
            failureResult: "An unknown or network error has occurred.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    setStatus({
      message: "",
      courseId: "",
      failureResult: "",
      successResult: "Request Created",
    });

    props.postSubmit();
  }

  return <>
    <Formik<CreateSessionRequestValue>
      onSubmit={onSubmit}
      initialValues={{
        message: "",
        courseId: null
      }}
      initialStatus={{
        message: "",
        courseId: "",
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
              <span>{format(props.start + props.duration, "MMM do, hh:mm a")} </span>
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm={2}>Course Name</Form.Label>
            <Col>
              <SearchSingleCourse
                name="courseId"
                search={async input => {
                  const maybeCourseData = await viewCourseData({
                    recentStudentUserId: props.apiKey.creator.userId,
                    partialName: input,
                    onlyRecent: true,
                    apiKey: props.apiKey.key,
                  });

                  return isApiErrorCode(maybeCourseData) ? [] : maybeCourseData;
                }}
                isInvalid={fprops.status.courseId !== ""}
                setFn={(e: CourseData | null) => fprops.setFieldValue("courseId", e?.course.courseId)} />
              <Form.Text className="text-danger">{fprops.status.courseId}</Form.Text>
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
                isInvalid={fprops.status.message !== ""}
              />
              <Form.Text className="text-danger">{fprops.status.message}</Form.Text>
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
