import React from "react"
import SearchSingleUser from "../components/SearchSingleUser";
import { Formik, FormikHelpers } from "formik";
import { Row, Col, Button, Form } from "react-bootstrap";
import { newSessionRequest, isApiErrorCode } from "../utils/utils";
import format from "date-fns/format";

type StudentCreateSessionRequestProps = {
  start: number;
  duration: number;
  apiKey: ApiKey;
  postSubmit: () =>void;
}

function StudentCreateSessionRequest(props: StudentCreateSessionRequestProps) {

  type CreateSessionRequestValue = {
    message: string,
    userId: number | null,
  }

  const onSubmit = async (values: CreateSessionRequestValue,
    { setStatus }: FormikHelpers<CreateSessionRequestValue>) => {

    if (values.userId == null) {
      setStatus({
        userId: "Please select a teacher.",
        message: "",
        failureResult: "",
      });
      return;
    }

    const maybeSessionRequest = await newSessionRequest({
      hostId: values.userId,
      attendeeId: props.apiKey.creator.id,
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
            userId: "",
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "USER_NONEXISTENT": {
          setStatus({
            message: "",
            userId: "This teacher does not exist.",
            failureResult: "",
            successResult: ""
          });
          break;
        }
        case "NEGATIVE_DURATION": {
          setStatus({
            message: "",
            userId: "",
            failureResult: "The duration you have selected is not valid.",
            successResult: ""
          });
          break;
        }
        default: {
          setStatus({
            message: "",
            userId: "",
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
      userId: "",
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
        userId: null
      }}
      initialStatus={{
        message: "",
        userId: "",
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
            <Form.Label column sm={2}>Teacher Name</Form.Label>
            <Col>
              <SearchSingleUser
                name="userId"
                isInvalid={fprops.status.userId !== ""}
                apiKey={props.apiKey}
                userKind={"USER"} setFn={e => fprops.setFieldValue("userId", e?.id)} />
              <Form.Text className="text-danger">{fprops.status.userId}</Form.Text>
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
