import React from "react";
import { Card } from "react-bootstrap";
import { EventContentArg } from "@fullcalendar/react"

function SessionRequestCard(props: { sessionRequest: SessionRequest; courseData: CourseData }) {
  return (
    <Card className="px-1 py-1 h-100 w-100 bg-danger text-light overflow-hidden" >
      Course: {props.courseData.name}
      <br />
      From: {props.sessionRequest.attendee.name}
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

function SessionCard(props: { sessionData: SessionData }) {
  const sessionData = props.sessionData;
  return <Card className="px-1 py-1 h-100 w-100 bg-primary text-light overflow-hidden">
    {sessionData.name}
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
      return <SessionCard sessionData={props.sessionData} />
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
