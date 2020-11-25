import React from "react";
import FullCalendar, { EventChangeArg, DateSelectArg } from "@fullcalendar/react"
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Card, Row, Col, Modal, Button, Form } from 'react-bootstrap';
import { Formik, FormikHelpers } from 'formik';

import { ViewSessionRequest } from '../components/ViewData';
import { newSessionRequestResponse, newSession, isApiErrorCode } from '../utils/utils';

type ReviewSessionRequestModalProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  sessionRequest: SessionRequest;
  apiKey: ApiKey;
}

function ReviewSessionRequestModal(props: ReviewSessionRequestModalProps) {
  type ReviewSessionRequestValues = {
    message: string,
  }

  const [duration, setDuration] = React.useState(props.sessionRequest.duration);
  const [startTime, setStartTime] = React.useState(props.sessionRequest.startTime);

  const onSubmit = async (values: ReviewSessionRequestValues,
    { setStatus }: FormikHelpers<ReviewSessionRequestValues>) => {

    const maybeSessionRequestResponse = await newSessionRequestResponse({
      sessionRequestId: props.sessionRequest.sessionRequestId,
      message: values.message,
      startTime: startTime,
      duration: duration,
      apiKey: props.apiKey.key
    });

    if (isApiErrorCode(maybeSessionRequestResponse )) {
      switch (maybeSessionRequestResponse) {
        case "API_KEY_NONEXISTENT": {
          setStatus("You have been automatically logged out. Please relogin.");
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          setStatus("You are not currently authorized to perform this action.");
          break;
        }
        case "APPT_EXISTENT": {
          setStatus("This appointment already exists.");
          break;
        }
        default: {
          setStatus("An unknown or network error has occurred.");
          break;
        }
      }
    } else {
      // On success close window
      props.setShow(false);
    }
  }

  const eventChangeHandler = (eca: EventChangeArg) => {
    const start = eca.event.start!.valueOf();
    const end = eca.event.end!.valueOf();
    setStartTime(start);
    setDuration(end - start);
  }

  return <Modal
    className="ReviewSessionRequestModal"
    show={props.show}
    onHide={() => props.setShow(false)}
    keyboard={false}
    size="xl"
    centered
  >
    <Modal.Header closeButton>
      <Modal.Title>Review Student Request</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Appointment Request</Card.Title>
              <ViewSessionRequest sessionRequest={props.sessionRequest} expanded />
            </Card.Body>
          </Card>
          <br />
          <Formik<ReviewSessionRequestValues>
            onSubmit={onSubmit}
            initialValues={{
              message: ""
            }}
            initialStatus=""
          >
            {(fprops) => (
              <Form
                noValidate
                onSubmit={fprops.handleSubmit} >
                <Form.Group>
                  <Form.Control
                    name="message"
                    type="text"
                    placeholder="(Optional) Message"
                    as="textarea"
                    rows={3}
                    onChange={fprops.handleChange}
                    isInvalid={!!fprops.errors.message}
                  />
                  <Form.Control.Feedback type="invalid">{fprops.errors.message}</Form.Control.Feedback>
                </Form.Group>
                <br />
                <Button type="submit" > Accept </Button>
                <Button variant="danger" onClick={() => props.setShow(false)}> Ignore </Button>
                <br />
                <Form.Text className="text-danger">{fprops.status}</Form.Text>
              </Form>)}
          </Formik>
        </Col>
        <Col>
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            unselectCancel=".ReviewSessionRequestModal"
            headerToolbar={false}
            allDaySlot={false}
            slotMinTime="08:00"
            slotMaxTime="18:00"
            eventChange={eventChangeHandler}
            selectable={true}
            selectMirror={true}
            initialDate={props.sessionRequest.startTime}
            height="auto"
            events={[{
              start: props.sessionRequest.startTime,
              end: props.sessionRequest.startTime + props.sessionRequest.duration,
              display: "background"
            }]}
            select={(dsa: DateSelectArg) => {
              setStartTime(dsa.start.valueOf());
              setDuration(dsa.end.valueOf() - dsa.start.valueOf());
            }}
            unselect={() => {
              setStartTime(props.sessionRequest.startTime);
              setDuration(props.sessionRequest.duration);
            }}
          />
        </Col>
      </Row>
    </Modal.Body>
  </Modal>
}

export default ReviewSessionRequestModal;
