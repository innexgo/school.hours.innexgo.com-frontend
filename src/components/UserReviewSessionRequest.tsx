import React from "react";
import FullCalendar, { EventClickArg, EventInput, DateSelectArg } from "@fullcalendar/react"
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Card, Row, Col, Button, Form } from 'react-bootstrap';
import ToggleButton from "react-bootstrap/ToggleButton";
import { Formik, FormikHelpers, FormikErrors } from 'formik';

import { ViewSessionRequest } from '../components/ViewData';
import { newSessionRequestResponse, newSession, newCommittment, viewSession, isApiErrorCode } from '../utils/utils';


type UserReviewSessionRequestProps = {
  postSubmit: () => void;
  sessionRequest: SessionRequest;
  apiKey: ApiKey;
}

function UserReviewSessionRequest(props: UserReviewSessionRequestProps) {

  type ReviewSessionRequestValues = {
    sessionId: number | null,
    startTime: number | null,
    duration: number | null,
    accepted: boolean | null,
    newSessionName: string,
    newSessionPublic: boolean
    message: string,
  }

  const onSubmit = async (values: ReviewSessionRequestValues,
    { setStatus, setErrors, }: FormikHelpers<ReviewSessionRequestValues>) => {

    if (values.accepted == null) {
      setErrors({ accepted: "Please select one of the options" });
      return;
    }

    if (!values.accepted) {
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
            setStatus("This request has already been resolved.");
            break;
          }
          default: {
            setStatus("An unknown or network error has occurred.");
            break;
          }
        }
        return;
      }
      // successfully exit
      props.postSubmit();
      return;
    }

    let sessionId: number;

    if (values.sessionId != null) {
      sessionId = values.sessionId
    } else {
      if (values.duration === null || values.startTime === null) {
        setErrors({ sessionId: "Please click on a preexisting session or drag to create a new one." });
        return;
      }

      if (values.newSessionName === "") {
        setErrors({ newSessionName: "Please enter an informative name" });
        return;
      }

      const maybeSession = await newSession({
        name: values.newSessionName,
        hostId: props.apiKey.creator.id,
        startTime: values.startTime,
        duration: values.duration,
        hidden: !values.newSessionPublic,
        apiKey: props.apiKey.key,
      });

      if (isApiErrorCode(maybeSession)) {
        switch (maybeSession) {
          case "API_KEY_NONEXISTENT": {
            setStatus("You have been automatically logged out. Please relogin.");
            break;
          }
          case "USER_NONEXISTENT": {
            setStatus("Host account does not exist.");
            break;
          }
          case "NEGATIVE_DURATION": {
            setStatus("The duration you have selected is not valid.");
            break;
          }
          default: {
            setStatus("An unknown error has occurred while creating session.");
            break;
          }
        }
        return;
      }
      sessionId = maybeSession.sessionId;
    }

    // create committment
    const maybeCommittment = await newCommittment({
      sessionId: sessionId,
      attendeeId: props.sessionRequest.attendee.id,
      cancellable: values.newSessionPublic,
      apiKey: props.apiKey.key
    });

    // TODO handle all other error codes that are possible
    // TODO if committment exists, we can just grab that
    if (isApiErrorCode(maybeCommittment)) {
      setStatus("An unknown error has occurred while creating committment.");
      return;
    }

    // create session request response
    const maybeSessionRequestResponse = await newSessionRequestResponse({
      sessionRequestId: props.sessionRequest.sessionRequestId,
      message: values.message,
      accepted: true,
      committmentId: maybeCommittment.committmentId,
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
          setStatus("This request has already been resolved.");
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

  
  return <>
    <Formik<ReviewSessionRequestValues>
      onSubmit={onSubmit}
      initialValues={{
        message: "",
        accepted: null,
        startTime: null,
        duration: null,
        sessionId: null,
        newSessionName: "",
        newSessionPublic: false
      }}
      initialStatus="">
      {(fprops) => (
        <Row className="UserReviewSessionRequest">
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Appointment Request</Card.Title>
                <ViewSessionRequest sessionRequest={props.sessionRequest} expanded />
              </Card.Body>
            </Card>
            <br />
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
                />
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
              <Form.Text className="text-danger">{fprops.errors.accepted}</Form.Text>
              <br />
              <Button type="submit" >Submit</Button>
              <br />
              <Form.Text className="text-danger">{fprops.status}</Form.Text>
            </Form>
          </Col>
          <Col>
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
              select={(dsa: DateSelectArg) => {
                fprops.setFieldValue("startTime", dsa.start.valueOf());
                fprops.setFieldValue("duration", dsa.end.valueOf() - dsa.start.valueOf());
                fprops.setFieldValue("sessionId", null);
              }}
              unselect={() => {
                fprops.setFieldValue("startTime", null);
                fprops.setFieldValue("duration", null);
              }}
              eventClick={(eca: EventClickArg) => {
                eca.view.calendar.unselect();
                fprops.setFieldValue("sessionId", parseInt(eca.event.id.split(':')[1]));
              }}
              eventSources={[
                async (
                  args: {
                    start: Date;
                    end: Date;
                    startStr: string;
                    endStr: string;
                    timeZone: string;
                  }) => {
                  const maybeSessions = await viewSession({
                    hostId: props.apiKey.creator.id,
                    minStartTime: args.start.valueOf(),
                    maxStartTime: args.end.valueOf(),
                    apiKey: props.apiKey.key
                  });

                  return isApiErrorCode(maybeSessions) ? [] : maybeSessions.map((x: Session): EventInput => ({
                    id: `Session:${x.sessionId}`,
                    title: x.name,
                    color: x.sessionId === fprops.values.sessionId ? "#3788D8" : "#6C757D",
                    start: new Date(x.startTime),
                    end: new Date(x.startTime + x.duration),
                  }));
                },
                [{
                  start: props.sessionRequest.startTime,
                  end: props.sessionRequest.startTime + props.sessionRequest.duration,
                  display: "background"
                }],
              ]}
            />
            <Form.Text className="text-danger">{fprops.status.sessionSelect}</Form.Text>
            <Form.Check
              name="newSessionPublic"
              disabled={fprops.values.startTime === null || fprops.values.duration === null}
              checked={fprops.values.newSessionPublic}
              onChange={fprops.handleChange}
              label="Visible to all students"
              isInvalid={!!fprops.errors.newSessionPublic}
              feedback={fprops.errors.newSessionPublic}
            />
            <Form.Group>
              <Form.Control
                name="newSessionName"
                type="text"
                disabled={fprops.values.startTime === null || fprops.values.duration === null}
                placeholder="Informative name"
                value={fprops.values.newSessionName}
                onChange={fprops.handleChange}
                isInvalid={!!fprops.errors.newSessionName}
              />
              <Form.Text className="text-danger">{fprops.errors.newSessionName}</Form.Text>
            </Form.Group>
          </Col>
        </Row>)}
    </Formik>
  </>
}

export default UserReviewSessionRequest;
