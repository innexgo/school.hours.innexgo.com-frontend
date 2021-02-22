import React from "react";
import { Async, AsyncProps } from 'react-async';
import FullCalendar, { EventClickArg, DateSelectArg } from "@fullcalendar/react"
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Card, Row, Col, Button, Form } from 'react-bootstrap';
import ToggleButton from "react-bootstrap/ToggleButton";
import { Formik, FormikHelpers } from 'formik';
import Loader from "../components/Loader";

import { ViewSessionRequest } from '../components/ViewData';
import { newAcceptSessionRequestResponse, newRejectSessionRequestResponse, newSession, newCommittment, viewSessionData, viewCourseData, isApiErrorCode } from '../utils/utils';


type CalendarWidgetProps = {
  sessionRequest: SessionRequest;
  apiKey: ApiKey;
  setFieldValue: (f: string, a: number | null) => void;
  sessionId: number | null
}

class CalendarWidget extends React.PureComponent<CalendarWidgetProps> {

  render() {
    const setStartTime = (x: number | null) => this.props.setFieldValue("startTime", x);
    const setDuration = (x: number | null) => this.props.setFieldValue("duration", x);
    const setSessionId = (x: number | null) => this.props.setFieldValue("sessionId", x);


    return <FullCalendar
      plugins={[timeGridPlugin, interactionPlugin]}
      initialView="timeGridDay"
      unselectCancel=".UserReviewSessionRequest"
      headerToolbar={false}
      dayHeaders={false}
      allDaySlot={false}
      height="auto"
      slotMinTime="08:00"
      slotMaxTime="18:00"
      slotDuration="00:15:00"
      selectable={true}
      selectMirror={true}
      initialDate={this.props.sessionRequest.startTime}
      datesSet={({ view }) => /* Keeps window size in sync */view.calendar.updateSize()}
      select={(dsa: DateSelectArg) => {
        setStartTime(dsa.start.valueOf());
        setDuration(dsa.end.valueOf() - dsa.start.valueOf());
        setSessionId(null);
      }}
      unselect={() => {
        setStartTime(null);
        setDuration(null);
      }}
      eventClick={(eca: EventClickArg) => {
        eca.view.calendar.unselect();
        setSessionId(parseInt(eca.event.id.split(':')[1]));
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

          const maybeSessionData = await viewSessionData({
            courseId: this.props.sessionRequest.course.courseId,
            minStartTime: args.start.valueOf(),
            maxStartTime: args.end.valueOf(),
            onlyRecent: true,
            apiKey: this.props.apiKey.key,
          });

          return isApiErrorCode(maybeSessionData)
            ? []
            : maybeSessionData.map(s => ({
              id: `Session:${s.session.sessionId}`,
              start: new Date(s.startTime),
              end: new Date(s.startTime + s.duration),
              color: s.session.sessionId === this.props.sessionId ? "#3788D8" : "#6C757D",
            }));
        },
      ]}
      slotLabelContent={a => <> </>}
    />
  }
}

type IUserReviewSessionRequestProps = {
  postSubmit: () => void;
  sessionRequest: SessionRequest;
  courseData: CourseData,
  apiKey: ApiKey;
}

function IUserReviewSessionRequest(props: IUserReviewSessionRequestProps) {

  type ReviewSessionRequestValues = {
    sessionId: number | null,
    startTime: number | null,
    duration: number | null,
    accepted: boolean | null,
    newSessionName: string,
    newSessionPublic: boolean
    message: string,
  }

  const defaultSessionName = `${props.courseData.name} - ${props.sessionRequest.attendee.name}`;

  const onSubmit = async (values: ReviewSessionRequestValues,
    { setStatus, setErrors, }: FormikHelpers<ReviewSessionRequestValues>) => {

    if (values.accepted == null) {
      setErrors({ accepted: "Please select one of the options" });
      return;
    }

    if (!values.accepted) {
      const maybeSessionRequestResponse = await newRejectSessionRequestResponse({
        sessionRequestId: props.sessionRequest.sessionRequestId,
        message: values.message,
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

      let sessionName: string;

      if (values.newSessionName === "") {
        sessionName = defaultSessionName;
      } else {
        sessionName = values.newSessionName;
      }

      // TODO location ???

      const maybeSession = await newSession({
        name: sessionName,
        courseId: props.sessionRequest.course.courseId,
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
      attendeeUserId: props.sessionRequest.attendee.userId,
      cancellable: values.newSessionPublic,
      apiKey: props.apiKey.key
    });

    // TODO handle all other error codes that are possible
    // TODO if committment exists, we can just grab that
    if (isApiErrorCode(maybeCommittment)) {
      switch (maybeCommittment) {
        case "COMMITTMENT_EXISTENT": {
          setStatus("Student is already scheduled for this session.");
          break;
        }
        default: {
          setStatus("An unknown error has occurred while creating committment.");
          break;
        }
      }
      return;
    }

    // create session request response
    const maybeSessionRequestResponse = await newAcceptSessionRequestResponse({
      sessionRequestId: props.sessionRequest.sessionRequestId,
      message: values.message,
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
      {(fprops) => <Form
        className="UserReviewSessionRequest"
        noValidate
        onSubmit={fprops.handleSubmit} >
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Appointment Request</Card.Title>
                <ViewSessionRequest apiKey={props.apiKey} sessionRequest={props.sessionRequest} expanded />
              </Card.Body>
            </Card>
            <br />
            <Form.Group>
              <Form.Control
                name="message"
                type="text"
                placeholder="(Optional) Message"
                as="textarea"
                rows={2}
                onChange={fprops.handleChange}
              />
            </Form.Group>
            <br />
            <Form.Group hidden={fprops.values.startTime === null || fprops.values.duration === null} >
              <Form.Label>New Session Name</Form.Label>
              <Form.Control
                name="newSessionName"
                type="text"
                placeholder={`${defaultSessionName} (default)`}
                value={fprops.values.newSessionName}
                onChange={fprops.handleChange}
                isInvalid={!!fprops.errors.newSessionName}
              />
              <Form.Text className="text-danger">{fprops.errors.newSessionName}</Form.Text>
            </Form.Group>
            <Form.Group hidden={fprops.values.startTime === null || fprops.values.duration === null} >
              <Form.Check
                name="newSessionPublic"
                checked={fprops.values.newSessionPublic}
                onChange={fprops.handleChange}
                label="New session visible to all students"
                isInvalid={!!fprops.errors.newSessionPublic}
                feedback={fprops.errors.newSessionPublic}
              />
            </Form.Group>
            <Form.Group>
              <ToggleButton
                key={0}
                type="radio"
                name="radio"
                value="ACCEPT"
                checked={fprops.values.accepted === true}
                onChange={_ => fprops.setFieldValue("accepted", true)}
                className="btn-success"
              > Accept </ToggleButton>
              <ToggleButton
                key={1}
                type="radio"
                name="radio"
                value="REJECT"
                checked={fprops.values.accepted === false}
                onChange={_ => fprops.setFieldValue("accepted", false)}
                className="btn-danger"
              > Reject </ToggleButton>
              <br />
              <Form.Text className="text-danger">{fprops.errors.accepted}</Form.Text>
            </Form.Group>
          </Col>
          <Col lg={8}>
            <table>
              <tr>
                <td>
                  <Form.Label>Requested Duration</Form.Label>
                </td>
                <td>
                  <Form.Label>Select or Create Session</Form.Label>
                </td>
              </tr>
              <tr>
                <td>
                  <FullCalendar
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView="timeGridDay"
                    unselectCancel=".UserReviewSessionRequest"
                    headerToolbar={false}
                    dayHeaders={false}
                    allDaySlot={false}
                    height="auto"
                    slotMinTime="08:00"
                    slotMaxTime="18:00"
                    slotDuration="00:15:00"
                    selectable={false}
                    initialDate={props.sessionRequest.startTime}
                    datesSet={({ view }) => /* Keeps window size in sync */ view.calendar.updateSize()}
                    events={[{
                      id: `SessionRequest:${props.sessionRequest.sessionRequestId}`,
                      start: new Date(props.sessionRequest.startTime),
                      end: new Date(props.sessionRequest.startTime + props.sessionRequest.duration),
                      display: "background",
                      sessionRequest: props.sessionRequest,
                    }]}
                  />
                </td>
                <td>
                  <CalendarWidget
                    {...props}
                    setFieldValue={fprops.setFieldValue}
                    sessionId={fprops.values.sessionId}
                  />
                </td>
              </tr>
            </table>
            {/*
              <Form.Text className="text-muted">
                Calendar displays a list of all sessions you have scheduled for this day.
                You may either assign a student to a preexisting session by clicking on the gray calendar item,
                or you can drag out a portion of the calendar to create a new session.
                If you create a new session, you can choose the name and visibility.
              </Form.Text>
              */}
            <Form.Text className="text-danger">{fprops.errors.sessionId}</Form.Text>
          </Col>
        </Row>
        <br />
        <Button type="submit" >Submit</Button>
        <br />
        <Form.Text className="text-danger">{fprops.status}</Form.Text>
      </Form>}
    </Formik>
  </>
}


type UserReviewSessionRequestProps = {
  postSubmit: () => void;
  sessionRequest: SessionRequest;
  apiKey: ApiKey;
}

const loadCourseData = async (props: AsyncProps<CourseData>) => {
  const maybeCourseData = await viewCourseData({
    courseId: props.courseId,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  });

  if (isApiErrorCode(maybeCourseData)) {
    throw Error;
  }
  // there's an invariant that there must always be one course data per valid course id
  return maybeCourseData[0];
}


function UserReviewSessionRequest(props: UserReviewSessionRequestProps) {
  return <Async promiseFn={loadCourseData}
    apiKey={props.apiKey}
    courseId={props.sessionRequest.course.courseId}>
    {_ => <>
      <Async.Pending><Loader /></Async.Pending>
      <Async.Rejected>
        <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
      </Async.Rejected>
      <Async.Fulfilled<CourseData>>{data =>
        <IUserReviewSessionRequest
          courseData={data}
          postSubmit={props.postSubmit}
          sessionRequest={props.sessionRequest}
          apiKey={props.apiKey}
        />
      }
      </Async.Fulfilled>
    </>}
  </Async>

}

export default UserReviewSessionRequest;
