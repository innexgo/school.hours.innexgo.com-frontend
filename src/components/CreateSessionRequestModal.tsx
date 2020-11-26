import React from "react"
import SearchSingleUser from "../components/SearchSingleUser";
import { Formik, FormikHelpers } from "formik";
import { Row, Col, Modal, Button, Form } from "react-bootstrap";
import { newSessionRequest, isApiErrorCode } from "../utils/utils";
import format from "date-fns/format";

type CreateSessionRequestModalProps = {
  show: boolean;
  start: number;
  duration: number;
  setShow: (show: boolean) => void;
  apiKey: ApiKey;
}

function CreateSessionRequestModal(props: CreateSessionRequestModalProps) {

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
        result: "",
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
            result: "You have been automatically logged out. Please relogin."
          });
          break;
        }
        case "USER_NONEXISTENT": {
          setStatus({
            message: "",
            userId: "This teacher does not exist.",
            result: "",
          });
          break;
        }
        case "NEGATIVE_DURATION": {
          setStatus({
            message: "",
            userId: "",
            result: "The duration you have selected is not valid.",
          });
          break;
        }
        default: {
          setStatus({
            message: "",
            userId: "",
            result: "An unknown or network error has occurred."
          });
          break;
        }
      }
      return;
    }

    // On success close window
    props.setShow(false);
  }


  return <Modal
    className="CreateSessionRequestModal"
    show={props.show}
    onHide={() => props.setShow(false)}
    keyboard={false}
    size="lg"
    centered
  >
    <Modal.Header closeButton>
      <Modal.Title id="modal-title">Request Appointment with Teacher</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Formik<CreateSessionRequestValue>
        onSubmit={onSubmit}
        initialValues={{
          message: "",
          userId: null
        }}
        initialStatus={{
          message: "",
          userId: "",
          result: ""
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
                  userKind={"USER"} setFn={e => fprops.setFieldValue("userId", e)} />
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
            <Form.Text className="text-danger">{fprops.status.result}</Form.Text>
          </Form>
        )}
      </Formik>
    </Modal.Body>
  </Modal>
}

export default CreateSessionRequestModal;