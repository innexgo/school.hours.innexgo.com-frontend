import React from "react";
import { EventContentArg } from "@fullcalendar/react"

// Pending request
function SessionRequestCard(props: { sessionRequest: SessionRequest }) {
  const sessionRequest = props.sessionRequest;
  return (
    <div className="px-1 py-1 h-100 w-100 bg-info text-light overflow-hidden" >
      To: {sessionRequest.course.name}
      <br />
      Msg: {sessionRequest.message}
    </div>
  )
}

// Rejected Session Request
function SessionRequestResponseCard(props: { sessionRequestResponse: SessionRequestResponse }) {
  const sessionRequestResponse = props.sessionRequestResponse;
  return (
    <div className="px-1 py-1 h-100 w-100 bg-light text-dark overflow-hidden" >
      To: {sessionRequestResponse.sessionRequest.course.name}
      <br />
      Response: {sessionRequestResponse.message}
    </div>
  )
}

// Committment
function CommittmentCard(props: { committment: Committment }) {
  const committment = props.committment;
  return (
    <div className="px-1 py-1 h-100 w-100 bg-primary text-light overflow-hidden" >
      Appt: {committment.session.name}
      <br/>
      At: {committment.session.course.name}
    </div>
  )
}

function CommittmentResponseCard(props: { committmentResponse: CommittmentResponse }) {
  const committmentResponse = props.committmentResponse;
  return (
    <div className="px-1 py-1 h-100 w-100 bg-success text-light overflow-hidden" >
      {committmentResponse.kind}
    </div>
  )
}

function SessionCard(props: { session: Session }) {
  const session = props.session;
  return <div className="px-1 py-1 h-100 w-100 bg-primary text-dark overflow-hidden">
    {session.name}
  </div>
}

function StudentCalendarCard(eventInfo: EventContentArg) {
  const props = eventInfo.event.extendedProps;
  switch (eventInfo.event.id.split(':')[0]) {
    case "Session":
      return <SessionCard session={props.session} />
    case "SessionRequestResponse":
      return <SessionRequestResponseCard sessionRequestResponse={props.sessionRequestResponse} />
    case "SessionRequest":
      return <SessionRequestCard sessionRequest={props.sessionRequest} />
    case "CommittmentResponse":
      return <CommittmentResponseCard committmentResponse={props.committmentResponse} />
    case "Committment":
      return <CommittmentCard committment={props.committment} />
  }
}

export default StudentCalendarCard;
