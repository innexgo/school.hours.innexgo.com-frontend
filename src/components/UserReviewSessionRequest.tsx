import React from "react";
import FullCalendar, { EventChangeArg, DateSelectArg } from "@fullcalendar/react"
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Tab, Tabs, Card, Row, Col, Button, Form } from 'react-bootstrap';
import ToggleButton from "react-bootstrap/ToggleButton";
import { Formik, FormikHelpers } from 'formik';

import { ViewSessionRequest } from '../components/ViewData';
import { newSessionRequestResponse, newSession, newCommittment, viewSession, isApiErrorCode } from '../utils/utils';


type UserReviewSessionRequestProps = {
  postSubmit: () => void;
  sessionRequest: SessionRequest;
  apiKey: ApiKey;
}

function UserReviewSessionRequest(props: UserReviewSessionRequestProps) {
  type ReviewSessionRequestValues = {
    accepted: boolean | null,
    message: string,
  }

  const [sessionId, setSessionId] = React.useState<number | null>(null);

  const onSubmit = async (values: ReviewSessionRequestValues,
    { setStatus }: FormikHelpers<ReviewSessionRequestValues>) => {

    if (sessionId == null) {
      setStatus({
        sessionSelect: "Please click on a session or create your own"
      });
      return;
    }

    const maybeSessionRequestResponse = await newSessionRequestResponse({
      sessionRequestId: props.sessionRequest.sessionRequestId,
      message: values.message,
      accepted: false,
      apiKey: props.apiKey.key
    });

    if (isApiErrorCode(maybeSessionRequestResponse)) {
      switch (maybeSessionRequestResponse) {
        case "API_KEY_NONEXISTENT": {
          setStatus("You have been automatically logged out. Please relogin.");
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          setStatus("You are not currently authorized to perform this action.");
          break;
        }
        case "SESSION_REQUEST_RESPONSE_EXISTENT": {
          setStatus("This appointment already exists.");
          break;
        }
        default: {
          setStatus("An unknown or network error has occurred.");
          break;
        }
      }
      return;
    }
    // On success close window
    props.postSubmit();
  }

  return <Row>
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
          message: "",
          accepted: null,
        }}
        initialStatus={{
          selectSession: "",
          result: ""
        }}>
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
            <div>
              <ToggleButton
                key={0}
                type="radio"
                name="radio"
                value="ACCEPT"
                checked={fprops.values.accepted === true}
                onChange={_ => fprops.setFieldValue("accepted", true)}
                className="btn-success"
              >
                Accept
                  </ToggleButton>
              <ToggleButton
                key={1}
                type="radio"
                name="radio"
                value="REJECT"
                checked={fprops.values.accepted === false}
                onChange={_ => fprops.setFieldValue("accepted", false)}
                className="btn-danger"
              >
                Reject
                  </ToggleButton>
            </div>
            <br />
            <Button type="submit" > Accept </Button>
            <br />
            <Form.Text className="text-danger">{fprops.status}</Form.Text>
          </Form>)}
      </Formik>
    </Col>
    <Col>
      <Tabs defaultActiveKey="select">
        <Tab eventKey="select" title="Select Session">
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            unselectCancel=".UserReviewSessionRequest"
            headerToolbar={false}
            allDaySlot={false}
            slotMinTime="08:00"
            slotMaxTime="18:00"
            selectable={true}
            selectMirror={true}
            initialDate={props.sessionRequest.startTime}
            height="auto"
            events={[{
              start: props.sessionRequest.startTime,
              end: props.sessionRequest.startTime + props.sessionRequest.duration,
              display: "background"
            }]}
          />
          {/*
                select={(dsa: DateSelectArg) => {
                  setStartTime(dsa.start.valueOf());
                  setDuration(dsa.end.valueOf() - dsa.start.valueOf());
                }}
                unselect={() => {
                  setStartTime(props.sessionRequest.startTime);
                  setDuration(props.sessionRequest.duration);
                }}

                */}
        </Tab>
        <Tab eventKey="create" title="Create New Session">
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            unselectCancel=".UserReviewSessionRequest"
            headerToolbar={false}
            allDaySlot={false}
            slotMinTime="08:00"
            slotMaxTime="18:00"
            selectable={true}
            selectMirror={true}
            initialDate={props.sessionRequest.startTime}
            height="auto"
            events={[{
              start: props.sessionRequest.startTime,
              end: props.sessionRequest.startTime + props.sessionRequest.duration,
              display: "background"
            }]}
          />
        </Tab>
      </Tabs>
    </Col>
  </Row>
}

export default UserReviewSessionRequest;
