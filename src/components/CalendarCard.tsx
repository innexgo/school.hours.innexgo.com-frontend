import { Async, AsyncProps } from 'react-async';
import { Card, Form } from "react-bootstrap";
import Loader from '../components/Loader';
import { EventContentArg } from "@fullcalendar/react"
import { Session, SessionData, Committment, SessionRequestResponse, SessionRequest, CourseData, committmentView} from '../utils/utils';
import {ApiKey, User} from '@innexgo/frontend-auth-api';
import {isErr} from '@innexgo/frontend-common';

function SessionRequestCard(props: {
    sessionRequest: SessionRequest;
    courseData: CourseData
    creator: User
}) {
  return (
    <Card className="px-1 py-1 h-100 w-100 bg-danger text-light overflow-hidden" >
      Course: {props.courseData.name}
      <br />
      From: {props.sessionRequest.creatorUserId}
      <br />
      Msg: {props.sessionRequest.message}
    </Card>
  )
}

function AcceptedSessionRequestResponseCard(props: {
  sessionRequestResponse: SessionRequestResponse;
  courseData: CourseData;
  sessionData: SessionData
}) {
  return (
    <Card className="px-1 py-1 h-100 w-100 bg-primary text-light overflow-hidden" >
      Appt: {props.sessionData.name}
      <br />
        Course: {props.courseData.name}
      <br />
        Message: {props.sessionRequestResponse.message}
    </Card>
  )
}

function RejectedSessionRequestResponseCard(props: {
  sessionRequestResponse: SessionRequestResponse;
  courseData: CourseData
}) {
  return (
    <Card className="px-1 py-1 h-100 w-100 bg-light text-dark overflow-hidden" >
      Course: {props.courseData.name}
      <br />
      Response: {props.sessionRequestResponse.message}
    </Card>
  )
}

async function loadSessionCommittments(props: AsyncProps<Committment[]>) {
  const maybeCommittments = await committmentView({
    sessionId: props.session.sessionId,
    responded: false,
    apiKey: props.apiKey.key
  });

  if (isErr(maybeCommittments)) {
    throw Error;
  }

  return maybeCommittments;
}


function SessionCard(props: {
  sessionData: SessionData,
  muted: boolean,
  permitted: boolean,
  apiKey: ApiKey
}) {
  const sessionData = props.sessionData;
  return <Card
    className={`px-1 py-1 h-100 w-100 text-light overflow-hidden`}
    style={{
      backgroundColor: props.permitted
      ? props.muted
        ? "#28A745"
        : "#3788D8"
      : "#6C757D"
    }}
  >
    {sessionData.name !== ""
      ? "Session: " + sessionData.name
      : <Async
        promiseFn={loadSessionCommittments}
        apiKey={props.apiKey}
        session={props.sessionData.session}>
        <Async.Pending>
          <Loader />
        </Async.Pending>
        <Async.Rejected>
          <Form.Text>An unknown error has occured.</Form.Text>
        </Async.Rejected>
        <Async.Fulfilled<Committment[]>>
          {cms => "Session: " + cms.map(cm => cm.attendee.name).join(', ')}
        </Async.Fulfilled>
      </Async>
    }
  </Card>
}

// Committment
function CommittmentCard(props: {
  courseData: CourseData;
  sessionData: SessionData
}) {
  return (
    <Card className="px-1 py-1 h-100 w-100 bg-primary text-light overflow-hidden" >
      Appt: {props.sessionData.name}
      <br />
      Course: {props.courseData.name}
    </Card>
  )
}

function CommittmentResponseCard(props: {
  sessionData: SessionData,
  committmentResponse: CommittmentResponse
}) {
  return (
    <Card className="px-1 py-1 h-100 w-100 bg-success text-light overflow-hidden" >
      Appt: {props.sessionData.name}
      <br />
      Attendee: {props.committmentResponse.committment.attendee.name}
      <br />
      Status: {props.committmentResponse.kind}
    </Card>
  )
}

function CalendarCard(eventInfo: EventContentArg) {
  const props = eventInfo.event.extendedProps;
  switch (eventInfo.event.id.split(':')[0]) {
    case "SessionRequest":
      return <SessionRequestCard sessionRequest={props.sessionRequest}
        courseData={props.courseData} />
    case "SessionRequestResponse":
      if (props.sessionRequestResponse.accepted) {
        return <AcceptedSessionRequestResponseCard
          sessionRequestResponse={props.sessionRequestResponse}
          courseData={props.courseData}
          sessionData={props.sessionData} />
      } else {
        return <RejectedSessionRequestResponseCard
          sessionRequestResponse={props.sessionRequestResponse}
          courseData={props.courseData}
        />
      }
    case "Session":
      return <SessionCard
        muted={props.muted}
        permitted={props.permitted}
        apiKey={props.apiKey}
        sessionData={props.sessionData}
      />
    case "CommittmentResponse":
      return <CommittmentResponseCard
        committmentResponse={props.committmentResponse}
        sessionData={props.sessionData}
      />
    case "Committment":
      return <CommittmentCard
        courseData={props.courseData}
        sessionData={props.sessionData}
      />
  }
}

export default CalendarCard;
