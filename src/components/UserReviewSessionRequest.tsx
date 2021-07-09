import React from "react";
import { Async, AsyncProps } from 'react-async';
import FullCalendar, { EventClickArg, DateSelectArg } from "@fullcalendar/react"
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Media, Card, Row, Col, Button, Form } from 'react-bootstrap';
import ToggleButton from "react-bootstrap/ToggleButton";
import { Formik, FormikHelpers } from 'formik';
import Loader from "../components/Loader";

import CalendarCard from '../components/CalendarCard';
import { sessionToEvent } from '../components/ToCalendar';
import { ViewSessionRequest } from '../components/ViewData';
import { CourseData, SessionRequest, sessionRequestResponseNew, sessionNew, sessionDataView, courseDataView, courseMembershipView } from '../utils/utils';

import { ApiKey, } from '@innexgo/frontend-auth-api';
import { isErr, unwrap } from '@innexgo/frontend-common';

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
      eventContent={CalendarCard}
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
          const courseMemberships = await courseMembershipView({
            userId: [this.props.apiKey.creator.userId],
            courseMembershipKind: ["INSTRUCTOR"],
            onlyRecent: true,
            apiKey: this.props.apiKey.key
          })
            .then(unwrap);

          const maybeSessionData = await sessionDataView({
            courseId: courseMemberships.map(cm => cm.course.courseId),
            minStartTime: args.start.valueOf(),
            maxStartTime: args.end.valueOf(),
            onlyRecent: true,
            apiKey: this.props.apiKey.key,
          })
            .then(unwrap);


          return maybeSessionData.map(s =>
            sessionToEvent({
              sessionData: s,
              relation: "INSTRUCTOR",
              apiKey: this.props.apiKey,
              muted: s.session.sessionId !== this.props.sessionId,
              permitted: s.session.course.courseId === this.props.sessionRequest.course.courseId
            }));
        },
      ]}
      slotLabelContent={_ => <> </>}
    />
  }
}

function ColorExplainer(props: { color: string; text: string }) {
  return <Media>
    <div
      className="mr-2"
      style={{
        borderStyle: "solid",
        height: 32,
        width: 32,
        backgroundColor: props.color
      }}
    />
    <Media.Body>
      <p>{props.text}</p>
    </Media.Body>
  </Media>
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
    endTime: number | null,
    accepted: boolean | null,
    sessionNewName: string,
    sessionNewPublic: boolean
    message: string,
  }

  const onSubmit = async (values: ReviewSessionRequestValues,
    { setStatus, setErrors, }: FormikHelpers<ReviewSessionRequestValues>) => {

    if (values.accepted == null) {
      setErrors({ accepted: "Please select one of the options" });
      return;
    }

    if (!values.accepted) {
      const maybeSessionRequestResponse = await sessionRequestResponseNew({
        sessionRequestId: props.sessionRequest.sessionRequestId,
        message: values.message,
        apiKey: props.apiKey.key
      });

      if (isErr(maybeSessionRequestResponse)) {
        switch (maybeSessionRequestResponse.Err) {
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
      if (values.endTime === null || values.startTime === null) {
        setErrors({ sessionId: "Please click on a preexisting session or drag to create a new one." });
        return;
      }

      const maybeSessionData = await sessionNew({
        name: values.sessionNewName,
        courseId: props.sessionRequest.course.courseId,
        startTime: values.startTime,
        endTime: values.endTime,
        apiKey: props.apiKey.key,
      });

      if (isErr(maybeSessionData)) {
        switch (maybeSessionData.Err) {
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
      sessionId = maybeSessionData.Ok.session.sessionId;
    }

    // create session request response
    const maybeSessionRequestResponse = await sessionRequestResponseNew({
      sessionRequestId: props.sessionRequest.sessionRequestId,
      message: values.message,
      sessionId: sessionId,
      apiKey: props.apiKey.key
    });

    if (isErr(maybeSessionRequestResponse)) {
      switch (maybeSessionRequestResponse.Err) {
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
        endTime: null,
        sessionId: null,
        sessionNewName: "",
        sessionNewPublic: false
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
            <Form.Group hidden={fprops.values.startTime === null || fprops.values.endTime === null} >
              <Form.Label>New Session Name</Form.Label>
              <Form.Control
                name="sessionNewName"
                type="text"
                placeholder="New Session Name (optional)"
                value={fprops.values.sessionNewName}
                onChange={fprops.handleChange}
                isInvalid={!!fprops.errors.sessionNewName}
              />
              <Form.Text className="text-danger">{fprops.errors.sessionNewName}</Form.Text>
            </Form.Group>
            <Form.Group hidden={fprops.values.startTime === null || fprops.values.endTime === null} >
              <Form.Check
                name="sessionNewPublic"
                checked={fprops.values.sessionNewPublic}
                onChange={fprops.handleChange}
                label="New session visible to all students"
                isInvalid={!!fprops.errors.sessionNewPublic}
                feedback={fprops.errors.sessionNewPublic}
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
            <br />
            <Button type="submit" >Submit</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status}</Form.Text>
          </Col>
          <Col lg={8}>
            <Row>
              <Col>
                <ColorExplainer color="#28A745" text="Valid Slot" />
              </Col>
              <Col>
                <ColorExplainer color="#6C757D" text="Invalid Slot" />
              </Col>
              <Col>
                <ColorExplainer color="#2788D8" text="Selected" />
              </Col>
            </Row>
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
                      end: new Date(props.sessionRequest.endTime),
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
  const maybeCourseData = await courseDataView({
    courseId: props.courseId,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  }).then(unwrap);

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
